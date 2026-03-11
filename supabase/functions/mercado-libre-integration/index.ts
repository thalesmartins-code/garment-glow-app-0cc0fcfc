import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ML_API = "https://api.mercadolibre.com";

async function mlFetch(path: string, accessToken: string) {
  const res = await fetch(`${ML_API}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`ML API error [${path}]:`, data);
    throw new Error(data.message || `ML API error: ${res.status}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { access_token, days = 30 } = await req.json();
    const periodDays = Math.min(Math.max(Number(days) || 30, 1), 90);

    if (!access_token) {
      return new Response(
        JSON.stringify({ error: "Missing access_token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Get user info
    const user = await mlFetch("/users/me", access_token);
    const sellerId = user.id;

    // 2. Fetch ALL orders using cursor-based pagination (from_id)
    // This avoids the 10,000 offset limit of the ML API
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - periodDays);
    const dateFromStr = dateFrom.toISOString();

    const PAGE_SIZE = 50;
    const MAX_ITERATIONS = 500; // safety cap: 25,000 orders max
    let allOrders: any[] = [];
    let totalAvailable = 0;
    let lastOrderId: number | null = null;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      // Build URL: first page uses offset=0, subsequent pages use the last order ID
      // to fetch only older orders (date_created.to) avoiding offset limits
      let url: string;
      if (i === 0) {
        url = `/orders/search?seller=${sellerId}&order.date_created.from=${dateFromStr}&sort=date_desc&limit=${PAGE_SIZE}`;
      } else {
        // Use offset-based for first 10k, then fall back to date-range slicing
        const currentOffset = i * PAGE_SIZE;
        if (currentOffset < 10000) {
          url = `/orders/search?seller=${sellerId}&order.date_created.from=${dateFromStr}&sort=date_desc&limit=${PAGE_SIZE}&offset=${currentOffset}`;
        } else {
          // Beyond offset limit: slice by date using the last order's creation date
          const lastOrder = allOrders[allOrders.length - 1];
          const lastDate = lastOrder?.date_created;
          if (!lastDate) break;
          url = `/orders/search?seller=${sellerId}&order.date_created.from=${dateFromStr}&order.date_created.to=${lastDate}&sort=date_desc&limit=${PAGE_SIZE}`;
        }
      }

      const ordersData = await mlFetch(url, access_token);
      const results = ordersData.results || [];

      if (i === 0) {
        totalAvailable = ordersData.paging?.total || 0;
      }

      if (results.length === 0) break;

      // For date-range slicing beyond 10k, deduplicate by order ID
      const existingIds = new Set(allOrders.map((o: any) => o.id));
      const newResults = results.filter((o: any) => !existingIds.has(o.id));

      if (newResults.length === 0) break;

      allOrders = allOrders.concat(newResults);

      // Stop if we got all or page wasn't full
      if (results.length < PAGE_SIZE || allOrders.length >= totalAvailable) {
        break;
      }
    }

    const orders = allOrders;
    console.log(`Fetched ${orders.length} orders of ${totalAvailable} total (period: ${periodDays} days)`);

    // 3. Aggregate metrics
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let approvedRevenue = 0;
    let cancelledOrders = 0;
    let shippedOrders = 0;
    const dailySales: Record<string, { total: number; approved: number; qty: number }> = {};

    for (const order of orders) {
      const amount = order.total_amount || 0;
      const date = order.date_created ? order.date_created.substring(0, 10) : null;
      const status = order.status;

      totalRevenue += amount;

      if (status === "paid" || status === "confirmed") {
        approvedRevenue += amount;
      }
      if (status === "cancelled") {
        cancelledOrders++;
      }
      if (order.shipping?.status === "shipped" || order.shipping?.status === "delivered") {
        shippedOrders++;
      }

      if (date) {
        if (!dailySales[date]) {
          dailySales[date] = { total: 0, approved: 0, qty: 0 };
        }
        dailySales[date].total += amount;
        dailySales[date].qty += 1;
        if (status === "paid" || status === "confirmed") {
          dailySales[date].approved += amount;
        }
      }
    }

    // 4. Get active listings count
    let activeListings = 0;
    try {
      const itemsSearch = await mlFetch(
        `/users/${sellerId}/items/search?status=active&limit=0`,
        access_token
      );
      activeListings = itemsSearch.paging?.total || 0;
    } catch {
      // non-critical
    }

    // 5. Build daily breakdown
    const dailyBreakdown = Object.entries(dailySales)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const response = {
      success: true,
      user: {
        id: user.id,
        nickname: user.nickname,
        country: user.country_id,
        permalink: user.permalink,
      },
      metrics: {
        total_revenue: totalRevenue,
        approved_revenue: approvedRevenue,
        total_orders: totalOrders,
        cancelled_orders: cancelledOrders,
        shipped_orders: shippedOrders,
        active_listings: activeListings,
        avg_ticket: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        period: `last_${periodDays}_days`,
      },
      daily_breakdown: dailyBreakdown,
      paging: { total: totalAvailable, fetched: orders.length },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("ML Integration error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
