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

/**
 * Fetch all orders for a single day, paginating with offset.
 * Daily volume should be well under 10k, so offset works fine.
 */
async function fetchOrdersForDay(
  sellerId: number,
  dayStart: string,
  dayEnd: string,
  accessToken: string
): Promise<any[]> {
  const PAGE_SIZE = 50;
  const MAX_OFFSET = 10000;
  let allOrders: any[] = [];
  let offset = 0;

  while (offset < MAX_OFFSET) {
    const url = `/orders/search?seller=${sellerId}&order.date_created.from=${dayStart}&order.date_created.to=${dayEnd}&sort=date_desc&limit=${PAGE_SIZE}&offset=${offset}`;
    const data = await mlFetch(url, accessToken);
    const results = data.results || [];
    allOrders = allOrders.concat(results);
    const total = data.paging?.total || 0;
    offset += PAGE_SIZE;

    if (results.length < PAGE_SIZE || offset >= total) break;
  }

  return allOrders;
}

/**
 * Generate day boundaries as ISO strings for each day in the period.
 */
function getDayIntervals(periodDays: number): Array<{ start: string; end: string; label: string }> {
  const intervals: Array<{ start: string; end: string; label: string }> = [];
  const now = new Date();

  for (let i = 0; i < periodDays; i++) {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    intervals.push({
      start: dayStart.toISOString(),
      end: dayEnd.toISOString(),
      label: dayStart.toISOString().substring(0, 10),
    });
  }

  return intervals;
}

/**
 * Run async tasks with a concurrency limit.
 */
async function parallelLimit<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
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

    // 2. Generate day intervals and fetch orders in parallel (5 concurrent)
    const intervals = getDayIntervals(periodDays);
    const CONCURRENCY = 5;

    const tasks = intervals.map((interval) => () =>
      fetchOrdersForDay(sellerId, interval.start, interval.end, access_token)
    );

    const ordersPerDay = await parallelLimit(tasks, CONCURRENCY);
    const allOrders = ordersPerDay.flat();

    // Deduplicate by order ID (edge case: orders spanning midnight)
    const seen = new Set<number>();
    const orders = allOrders.filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });

    console.log(
      `Fetched ${orders.length} unique orders across ${periodDays} days (${intervals.length} day-intervals, concurrency: ${CONCURRENCY})`
    );

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
      paging: { total: totalOrders, fetched: totalOrders },
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
