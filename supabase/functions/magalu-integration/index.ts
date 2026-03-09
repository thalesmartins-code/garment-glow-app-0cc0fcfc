import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAGALU_API_BASE = "https://api.magalu.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAGALU_API_KEY = Deno.env.get("MAGALU_API_KEY");
    const MAGALU_API_KEY_ID = Deno.env.get("MAGALU_API_KEY_ID");
    const MAGALU_API_KEY_SECRET = Deno.env.get("MAGALU_API_KEY_SECRET");

    if (!MAGALU_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Magalu API Key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, tenant_id } = await req.json();

    const apiHeaders: Record<string, string> = {
      "x-api-key": MAGALU_API_KEY,
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    // Add tenant header if provided (multi-seller support)
    if (tenant_id) {
      apiHeaders["x-tenant-id"] = tenant_id;
    }

    if (action === "test_connection") {
      // Test the API Key by trying to list orders
      const response = await fetch(`${MAGALU_API_BASE}/seller/v1/orders?_limit=1`, {
        headers: apiHeaders,
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { raw: responseText };
      }

      if (!response.ok) {
        console.error("Magalu connection test failed:", response.status, data);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Connection test failed (${response.status})`,
            details: data,
          }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Connection successful", data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_orders") {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const dateFrom = thirtyDaysAgo.toISOString().split("T")[0];
      const dateTo = today.toISOString().split("T")[0];

      const response = await fetch(
        `${MAGALU_API_BASE}/seller/v1/orders?_limit=100&created_at_from=${dateFrom}&created_at_to=${dateTo}`,
        { headers: apiHeaders }
      );

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { raw: responseText };
      }

      if (!response.ok) {
        console.error("Magalu get_orders failed:", response.status, data);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to fetch orders", details: data }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate metrics from orders
      const orders = Array.isArray(data) ? data : data?.results || data?.items || [];
      
      let totalRevenue = 0;
      let approvedRevenue = 0;
      let totalOrders = orders.length;
      let cancelledOrders = 0;
      let shippedOrders = 0;

      for (const order of orders) {
        const amount = order.total_amount || order.total || 0;
        totalRevenue += amount;

        const status = (order.status || "").toLowerCase();
        if (status === "cancelled" || status === "canceled") {
          cancelledOrders++;
        } else {
          approvedRevenue += amount;
        }
        if (status === "shipped" || status === "delivered") {
          shippedOrders++;
        }
      }

      const avgTicket = totalOrders > 0 ? approvedRevenue / (totalOrders - cancelledOrders || 1) : 0;

      return new Response(
        JSON.stringify({
          success: true,
          metrics: {
            total_revenue: totalRevenue,
            approved_revenue: approvedRevenue,
            total_orders: totalOrders,
            cancelled_orders: cancelledOrders,
            shipped_orders: shippedOrders,
            avg_ticket: avgTicket,
            period: `${dateFrom} a ${dateTo}`,
          },
          orders,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: test_connection, get_orders" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Magalu integration error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
