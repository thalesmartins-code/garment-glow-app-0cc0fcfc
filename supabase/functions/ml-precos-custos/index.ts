import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ML_API = "https://api.mercadolibre.com";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getUserAndToken(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  mlUserId: string,
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await supabase.auth.getUser(token);
  if (claimsErr || !claimsData?.user) return null;
  const { data: tokenRow, error: tokenErr } = await supabase
    .from("ml_tokens")
    .select("access_token")
    .eq("user_id", claimsData.user.id)
    .eq("ml_user_id", mlUserId)
    .single();
  if (tokenErr || !tokenRow?.access_token) return null;
  return tokenRow.access_token as string;
}

async function mlGet(path: string, mlToken: string) {
  const res = await fetch(`${ML_API}${path}`, {
    headers: { Authorization: `Bearer ${mlToken}`, Accept: "application/json" },
  });
  if (!res.ok) {
    console.error(`ML API error [${res.status}] ${path}:`, await res.text());
    return null;
  }
  return res.json();
}

// ── type=prices: preços dos anúncios ativos do vendedor ─────────────────────

async function handleItemPrices(mlUserId: string, mlToken: string) {
  const searchData = await mlGet(
    `/users/${mlUserId}/items/search?status=active&limit=50`,
    mlToken,
  );
  if (!searchData?.results?.length) return jsonResponse({ items: [], total: 0 });

  const itemIds: string[] = searchData.results.slice(0, 50);
  const attrs = "id,title,thumbnail,price,original_price,listing_type_id,category_id,status";
  const batchData = await mlGet(
    `/items?ids=${itemIds.join(",")}&attributes=${attrs}`,
    mlToken,
  );
  if (!batchData) return jsonResponse({ items: [], total: searchData.paging?.total ?? 0 });

  const items = (Array.isArray(batchData) ? batchData : [])
    .filter((r: any) => r.code === 200 && r.body?.id)
    .map((r: any) => r.body);

  const [priceResults, salePriceResults] = await Promise.all([
    Promise.allSettled(
      items.map((item: any) => mlGet(`/items/${item.id}/prices`, mlToken)),
    ),
    Promise.allSettled(
      items.map((item: any) =>
        mlGet(`/items/${item.id}/sale_price?context=channel_marketplace`, mlToken),
      ),
    ),
  ]);

  const enriched = items.map((item: any, i: number) => {
    const priceData =
      priceResults[i].status === "fulfilled" ? priceResults[i].value : null;
    const salePriceData =
      salePriceResults[i].status === "fulfilled" ? salePriceResults[i].value : null;
    const standardPrice = priceData?.prices?.find((p: any) => p.type === "standard");
    const promoPrice = priceData?.prices?.find((p: any) => p.type === "promotion");
    return {
      item_id: item.id,
      title: item.title,
      thumbnail: item.thumbnail ?? "",
      category_id: item.category_id ?? "",
      listing_type_id: item.listing_type_id ?? "",
      price_standard: standardPrice?.amount ?? item.price ?? 0,
      price_promo: promoPrice?.amount ?? null,
      price_sale: salePriceData?.amount ?? item.price ?? 0,
      currency_id: standardPrice?.currency_id ?? "BRL",
      last_updated: standardPrice?.last_updated ?? null,
      has_promotion: !!promoPrice,
    };
  });

  return jsonResponse({ items: enriched, total: searchData.paging?.total ?? enriched.length });
}

// ── type=costs: comissões por tipo de anúncio ───────────────────────────────

async function handleListingCosts(mlToken: string, params: URLSearchParams) {
  const price = params.get("price") ?? "100";
  const categoryId = params.get("category_id");
  const logisticType = params.get("logistic_type");
  const shippingMode = params.get("shipping_mode");

  let qs = `price=${price}&currency_id=BRL`;
  if (categoryId) qs += `&category_id=${categoryId}`;
  if (logisticType) qs += `&logistic_type=${logisticType}`;
  if (shippingMode) qs += `&shipping_mode=${shippingMode}`;

  const data = await mlGet(`/sites/MLB/listing_prices?${qs}`, mlToken);
  if (!data) return jsonResponse({ costs: [] });

  const RELEVANT = ["gold_pro", "gold_special", "free"];
  const costs = (Array.isArray(data) ? data : [data])
    .filter((c: any) => RELEVANT.includes(c.listing_type_id))
    .map((c: any) => ({
      listing_type_id: c.listing_type_id,
      listing_type_name: c.listing_type_name,
      listing_exposure: c.listing_exposure,
      sale_fee_amount: c.sale_fee_amount ?? 0,
      percentage_fee: c.sale_fee_details?.percentage_fee ?? 0,
      fixed_fee: c.sale_fee_details?.fixed_fee ?? 0,
      financing_add_on_fee: c.sale_fee_details?.financing_add_on_fee ?? 0,
      currency_id: c.currency_id ?? "BRL",
    }));

  return jsonResponse({ costs });
}

// ── type=references: custo real por categoria dos itens do vendedor ─────────

async function handlePriceReferences(mlUserId: string, mlToken: string) {
  const searchData = await mlGet(
    `/users/${mlUserId}/items/search?status=active&limit=20`,
    mlToken,
  );
  if (!searchData?.results?.length) return jsonResponse({ references: [] });

  const itemIds: string[] = searchData.results.slice(0, 20);
  const batchData = await mlGet(
    `/items?ids=${itemIds.join(",")}&attributes=id,title,price,listing_type_id,category_id`,
    mlToken,
  );
  if (!batchData) return jsonResponse({ references: [] });

  const items = (Array.isArray(batchData) ? batchData : [])
    .filter((r: any) => r.code === 200 && r.body?.id)
    .map((r: any) => r.body);

  // Busca nomes das categorias
  const categoryIds = [...new Set(items.map((i: any) => i.category_id).filter(Boolean))];
  const catResults = await Promise.allSettled(
    categoryIds.map((cid) => mlGet(`/categories/${cid}`, mlToken)),
  );
  const catMap: Record<string, string> = {};
  categoryIds.forEach((cid, i) => {
    const r = catResults[i];
    if (r.status === "fulfilled" && r.value?.name) catMap[cid as string] = r.value.name;
  });

  // Busca listing_prices real por item
  const costResults = await Promise.allSettled(
    items.map((item: any) => {
      const qs = `price=${item.price}&category_id=${item.category_id}&currency_id=BRL&listing_type_id=${item.listing_type_id}`;
      return mlGet(`/sites/MLB/listing_prices?${qs}`, mlToken);
    }),
  );

  const references = items.map((item: any, i: number) => {
    const costData =
      costResults[i].status === "fulfilled" ? costResults[i].value : null;
    const cost = Array.isArray(costData)
      ? costData.find((c: any) => c.listing_type_id === item.listing_type_id) ?? costData[0]
      : costData;
    return {
      item_id: item.id,
      title: item.title,
      category_id: item.category_id,
      category_name: catMap[item.category_id] ?? item.category_id,
      listing_type_id: item.listing_type_id,
      price: item.price ?? 0,
      sale_fee_amount: cost?.sale_fee_amount ?? 0,
      percentage_fee: cost?.sale_fee_details?.percentage_fee ?? 0,
    };
  });

  return jsonResponse({ references });
}

// ── Main ────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const mlUserIdRaw = url.searchParams.get("ml_user_id");
    const type = url.searchParams.get("type") ?? "prices";

    const mlUserIdParsed = z.string().min(1).safeParse(mlUserIdRaw);
    if (!mlUserIdParsed.success) return jsonResponse({ error: "ml_user_id required" }, 400);
    const mlUserId = mlUserIdParsed.data;

    const mlToken = await getUserAndToken(req, supabase, mlUserId);
    if (!mlToken) return jsonResponse({ error: "Unauthorized or no ML token" }, 401);

    console.log(`ml-precos-custos: type=${type} store=${mlUserId}`);

    if (type === "prices")     return handleItemPrices(mlUserId, mlToken);
    if (type === "costs")      return handleListingCosts(mlToken, url.searchParams);
    if (type === "references") return handlePriceReferences(mlUserId, mlToken);

    return jsonResponse({ error: "Unknown type" }, 400);
  } catch (err) {
    console.error("ml-precos-custos error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
