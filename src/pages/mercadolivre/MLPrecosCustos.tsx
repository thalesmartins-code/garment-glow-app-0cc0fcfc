import { useState, useCallback } from "react";
import {
  DollarSign, Tag, Calculator, BarChart3, Plug, RefreshCw,
  Info, ChevronDown, ChevronUp, CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { MLPageHeader } from "@/components/mercadolivre/MLPageHeader";
import {
  useMLPrecosCustos,
  type MLItemPrice,
  type MLListingCost,
  type MLPriceReference,
} from "@/hooks/useMLPrecosCustos";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────

const currFmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const pctFmt = (v: number) => `${v.toFixed(1)}%`;

// ── Not Connected ─────────────────────────────────────────────────────────────

function NotConnected() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Plug className="w-16 h-16 text-muted-foreground/40" />
      <h2 className="text-xl font-semibold">Mercado Livre não conectado</h2>
      <p className="text-muted-foreground text-sm">
        Conecte sua conta para acessar preços e custos.
      </p>
      <Button asChild>
        <Link to="/api/integracoes">Conectar conta</Link>
      </Button>
    </div>
  );
}

// ── Real data badge ───────────────────────────────────────────────────────────

function RealDataBadge({ isRealData }: { isRealData: boolean }) {
  if (!isRealData) return null;
  return (
    <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1 text-xs">
      <CheckCircle2 className="w-3 h-3" /> Dados reais
    </Badge>
  );
}

// ── Listing type badge ────────────────────────────────────────────────────────

function ListingTypeBadge({ type }: { type: string }) {
  if (type === "gold_pro")
    return <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30">Premium</Badge>;
  if (type === "gold_special")
    return <Badge className="bg-blue-500/15 text-blue-700 border-blue-500/30">Clássica</Badge>;
  return <Badge variant="outline">Gratuita</Badge>;
}

// ── Tab: Preços de Produtos ───────────────────────────────────────────────────

function PrecosProdutos({
  items,
  loading,
  isRealData,
}: {
  items: MLItemPrice[];
  loading: boolean;
  isRealData: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.item_id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Buscar por título ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <RealDataBadge isRealData={isRealData} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Preços dos Anúncios Ativos</CardTitle>
          <CardDescription className="text-xs">
            Preços standard e promocionais dos seus produtos — dados diretos da API do Mercado Livre.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Item</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Preço Standard</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Preço Promo</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Preço de Venda</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16 mx-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24 ml-auto" /></td>
                      </tr>
                    ))
                  : filtered.length === 0
                  ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          {items.length === 0 ? "Nenhum anúncio ativo encontrado." : "Nenhum resultado para a busca."}
                        </td>
                      </tr>
                    )
                  : filtered.map((item) => (
                      <tr key={item.item_id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt=""
                                className="w-8 h-8 object-contain rounded shrink-0 bg-muted"
                              />
                            )}
                            <div>
                              <p className="font-medium text-foreground leading-tight line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.item_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {currFmt(item.price_standard)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {item.price_promo != null ? (
                            <span className="text-emerald-600 font-medium">
                              {currFmt(item.price_promo)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold">
                          {currFmt(item.price_sale)}
                          {item.has_promotion && (
                            <Badge className="ml-1.5 bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px] px-1 py-0">
                              Promo
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ListingTypeBadge type={item.listing_type_id} />
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {item.last_updated
                            ? new Date(item.last_updated).toLocaleDateString("pt-BR")
                            : "—"}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab: Custos por Vender ────────────────────────────────────────────────────

function CustosPorVender({
  costs,
  loading,
  isRealData,
}: {
  costs: MLListingCost[];
  loading: boolean;
  isRealData: boolean;
}) {
  const chartData = costs
    .filter((c) => c.percentage_fee > 0)
    .map((c) => ({
      name: c.listing_type_name,
      comissao: c.percentage_fee,
    }));

  const EXPOSURE_LABEL: Record<string, string> = {
    highest: "Máxima",
    high: "Alta",
    mid: "Média",
    low: "Baixa",
    lowest: "Mínima",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <RealDataBadge isRealData={isRealData} />
        {isRealData && (
          <p className="text-xs text-muted-foreground">
            Comissões calculadas pela API do Mercado Livre para MLB.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
          : costs.map((cost) => (
              <Card
                key={cost.listing_type_id}
                className={cost.listing_type_id === "gold_pro" ? "border-yellow-500/40" : ""}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{cost.listing_type_name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {EXPOSURE_LABEL[cost.listing_exposure] ?? cost.listing_exposure}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Comissão por venda</span>
                    <span className="font-semibold text-foreground">{pctFmt(cost.percentage_fee)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Taxa fixa</span>
                    <span className="font-medium">
                      {cost.fixed_fee > 0 ? currFmt(cost.fixed_fee) : "Grátis"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs flex items-center gap-1">
                      Parcelamento
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Taxa adicional quando o comprador parcela a compra
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="font-medium">
                      {cost.financing_add_on_fee > 0
                        ? `+${pctFmt(cost.financing_add_on_fee)}`
                        : "—"}
                    </span>
                  </div>
                  {cost.percentage_fee > 0 && (
                    <>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        Ex.: venda de {currFmt(200)} → custo de{" "}
                        <span className="font-semibold text-destructive">
                          {currFmt(200 * (cost.percentage_fee / 100) + cost.fixed_fee)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Comparativo de Comissões por Tipo de Anúncio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <RechartsTooltip
                  formatter={(v: number) => [`${v}%`, "Comissão"]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="comissao" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#f59e0b" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-4 pb-3 px-4">
          <div className="flex items-start gap-2 text-sm text-amber-700">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Os custos de envio variam conforme o tipo de logística e o peso faturável.
              Use a aba <strong>Calculadora</strong> para simular o custo total por venda.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab: Referências de Preços ────────────────────────────────────────────────

function ReferenciasPreccos({
  references,
  loading,
  isRealData,
}: {
  references: MLPriceReference[];
  loading: boolean;
  isRealData: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <RealDataBadge isRealData={isRealData} />
        {isRealData && (
          <p className="text-xs text-muted-foreground">
            Comissão real calculada pela API para cada produto e categoria.
          </p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Custo Real por Produto</CardTitle>
          <CardDescription className="text-xs">
            Comissão calculada pela API do Mercado Livre com base no preço e categoria de cada anúncio.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Produto</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Categoria</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Preço</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Comissão %</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Custo</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Líquido</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : references.length === 0
                  ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          Nenhuma referência disponível.
                        </td>
                      </tr>
                    )
                  : references.map((ref) => {
                      const liquido = ref.price - ref.sale_fee_amount;
                      return (
                        <tr
                          key={ref.item_id}
                          className="border-b hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium line-clamp-1">{ref.title}</p>
                            <p className="text-xs text-muted-foreground">{ref.item_id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs">{ref.category_name}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ListingTypeBadge type={ref.listing_type_id} />
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">
                            {currFmt(ref.price)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-destructive font-medium">
                              {pctFmt(ref.percentage_fee)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-destructive">
                            -{currFmt(ref.sale_fee_amount)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-emerald-600">
                            {currFmt(liquido)}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {references.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Líquida por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={references.slice(0, 10).map((r) => ({
                  name: r.title.length > 18 ? r.title.substring(0, 18) + "…" : r.title,
                  liquido: parseFloat((r.price - r.sale_fee_amount).toFixed(2)),
                  comissao: parseFloat(r.sale_fee_amount.toFixed(2)),
                }))}
                barSize={28}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                <RechartsTooltip
                  formatter={(v: number, name: string) => [
                    currFmt(v),
                    name === "liquido" ? "Líquido" : "Comissão",
                  ]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="liquido" name="liquido" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comissao" name="comissao" stackId="a" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Tab: Calculadora ──────────────────────────────────────────────────────────

const LOGISTIC_OPTIONS = [
  { value: "drop_off",   label: "Drop Off (ME2)",       shipping_mode: "me2" },
  { value: "fulfillment",label: "Full (Fulfillment)",   shipping_mode: "me2" },
  { value: "self_service",label: "Flex (Self Service)", shipping_mode: "me2" },
  { value: "custom",     label: "Envio próprio",        shipping_mode: "custom" },
];

interface CalcResult {
  listing_type_id: string;
  listing_name: string;
  sale_price: number;
  commission_pct: number;
  commission_value: number;
  fixed_fee: number;
  shipping_cost: number;
  total_deductions: number;
  net_revenue: number;
  profit: number;
  margin_pct: number;
}

function Calculadora({
  fetchCosts,
  connected,
}: {
  fetchCosts: UseMLPrecosCustosResult["fetchCosts"];
  connected: boolean;
}) {
  const [productCost, setProductCost] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [logisticType, setLogisticType] = useState("drop_off");
  const [shippingCostInput, setShippingCostInput] = useState("");
  const [results, setResults] = useState<CalcResult[] | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  const marginColor = (pct: number) => {
    if (pct >= 20) return "text-emerald-600";
    if (pct >= 10) return "text-amber-600";
    return "text-destructive";
  };

  const calculate = useCallback(async () => {
    const cost = parseFloat(productCost.replace(",", ".")) || 0;
    const price = parseFloat(salePrice.replace(",", ".")) || 0;
    if (price <= 0) return;

    const logisticOpt = LOGISTIC_OPTIONS.find((o) => o.value === logisticType);

    setCalculating(true);
    try {
      let costs: MLListingCost[] = [];

      if (connected) {
        costs = await fetchCosts({
          price,
          logisticType,
          shippingMode: logisticOpt?.shipping_mode,
        });
      }

      // Fallback rates if API returns nothing
      if (costs.length === 0) {
        costs = [
          { listing_type_id: "gold_pro",      listing_type_name: "Premium",  listing_exposure: "highest", percentage_fee: 16, fixed_fee: 6, financing_add_on_fee: 23, sale_fee_amount: 0, currency_id: "BRL" },
          { listing_type_id: "gold_special",  listing_type_name: "Clássica", listing_exposure: "highest", percentage_fee: 12, fixed_fee: 6, financing_add_on_fee: 0,  sale_fee_amount: 0, currency_id: "BRL" },
        ];
      }

      // Shipping cost: prefer custom input, otherwise estimate from logistic type
      const LOGISTIC_ESTIMATE: Record<string, number> = {
        fulfillment: 8.5, drop_off: 6.0, self_service: 5.0, custom: 0,
      };
      const shippingCost = shippingCostInput
        ? parseFloat(shippingCostInput.replace(",", ".")) || 0
        : (LOGISTIC_ESTIMATE[logisticType] ?? 0);

      const calc: CalcResult[] = costs
        .filter((c) => ["gold_pro", "gold_special"].includes(c.listing_type_id))
        .map((c) => {
          const commission_value = price * (c.percentage_fee / 100);
          const total_deductions = commission_value + c.fixed_fee + shippingCost;
          const net_revenue = price - total_deductions;
          const profit = net_revenue - cost;
          const margin_pct = price > 0 ? (profit / price) * 100 : 0;
          return {
            listing_type_id: c.listing_type_id,
            listing_name: c.listing_type_name,
            sale_price: price,
            commission_pct: c.percentage_fee,
            commission_value,
            fixed_fee: c.fixed_fee,
            shipping_cost: shippingCost,
            total_deductions,
            net_revenue,
            profit,
            margin_pct,
          };
        });

      setResults(calc);
    } finally {
      setCalculating(false);
    }
  }, [productCost, salePrice, logisticType, shippingCostInput, fetchCosts, connected]);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Simulador de Precificação
          </CardTitle>
          <CardDescription className="text-xs">
            {connected
              ? "Comissões calculadas em tempo real pela API do Mercado Livre."
              : "Usando taxas estimadas — conecte sua conta para valores precisos."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="product-cost" className="text-xs">Custo do produto (R$)</Label>
              <Input
                id="product-cost"
                placeholder="0,00"
                value={productCost}
                onChange={(e) => setProductCost(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sale-price" className="text-xs">Preço de venda (R$)</Label>
              <Input
                id="sale-price"
                placeholder="0,00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Logística</Label>
              <Select value={logisticType} onValueChange={setLogisticType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOGISTIC_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipping-cost" className="text-xs flex items-center gap-1">
                Custo de envio (R$)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Deixe em branco para usar estimativa por tipo de logística
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="shipping-cost"
                placeholder="Estimativa automática"
                value={shippingCostInput}
                onChange={(e) => setShippingCostInput(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={calculate} disabled={calculating} className="w-full sm:w-auto gap-1.5">
            {calculating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            {calculating ? "Calculando..." : "Calcular"}
          </Button>
        </CardContent>
      </Card>

      {results && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Resultado por tipo de anúncio
            </p>
            {connected && (
              <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 gap-1 text-xs">
                <CheckCircle2 className="w-3 h-3" /> Comissões reais
              </Badge>
            )}
          </div>

          {results.map((r) => (
            <Card
              key={r.listing_type_id}
              className={r.listing_type_id === "gold_pro" ? "border-yellow-500/40" : ""}
            >
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{r.listing_name}</span>
                    {r.listing_type_id === "gold_pro" && (
                      <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30 text-xs">
                        Recomendado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Lucro</p>
                      <p className={`font-bold text-sm tabular-nums ${marginColor(r.margin_pct)}`}>
                        {currFmt(r.profit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Margem</p>
                      <p className={`font-bold text-sm ${marginColor(r.margin_pct)}`}>
                        {pctFmt(r.margin_pct)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                      onClick={() =>
                        setShowDetail(showDetail === r.listing_type_id ? null : r.listing_type_id)
                      }
                    >
                      {showDetail === r.listing_type_id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {showDetail === r.listing_type_id && (
                  <div className="mt-3 pt-3 border-t space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Preço de venda</span>
                      <span className="tabular-nums font-medium">{currFmt(r.sale_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        Comissão ({pctFmt(r.commission_pct)})
                      </span>
                      <span className="tabular-nums text-destructive">
                        -{currFmt(r.commission_value)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Taxa fixa</span>
                      <span className="tabular-nums text-destructive">-{currFmt(r.fixed_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Custo de envio</span>
                      <span className="tabular-nums text-destructive">
                        -{currFmt(r.shipping_cost)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Receita líquida</span>
                      <span className="tabular-nums font-semibold">{currFmt(r.net_revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Custo do produto</span>
                      <span className="tabular-nums text-destructive">
                        -{currFmt(parseFloat(productCost.replace(",", ".") || "0"))}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span className="text-xs">Lucro líquido</span>
                      <span className={`tabular-nums ${marginColor(r.margin_pct)}`}>
                        {currFmt(r.profit)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comparativo de Margem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={results.map((r) => ({
                    name: r.listing_name,
                    margem: parseFloat(r.margin_pct.toFixed(1)),
                  }))}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <RechartsTooltip
                    formatter={(v: number) => [`${v}%`, "Margem"]}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="margem" radius={[4, 4, 0, 0]}>
                    {results.map((r, i) => (
                      <Cell
                        key={i}
                        fill={
                          r.margin_pct >= 20 ? "#22c55e" : r.margin_pct >= 10 ? "#f59e0b" : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Import type used in Calculadora ──────────────────────────────────────────
import type { UseMLPrecosCustosResult } from "@/hooks/useMLPrecosCustos";

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MLPrecosCustos() {
  const {
    items,
    itemsTotal,
    costs,
    references,
    loading,
    isRealData,
    connected,
    refresh,
    refreshing,
    fetchCosts,
  } = useMLPrecosCustos();

  if (!connected) {
    return (
      <div className="space-y-6">
        <MLPageHeader title="Preços e Custos" lastUpdated={null} />
        <NotConnected />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MLPageHeader title="Preços e Custos" lastUpdated={null}>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          className="gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Atualizando…" : "Atualizar"}
        </Button>
      </MLPageHeader>

      <Tabs defaultValue="precos">
        <TabsList className="h-9">
          <TabsTrigger value="precos" className="gap-1.5 text-xs">
            <Tag className="w-3.5 h-3.5" /> Preços
            {itemsTotal > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {itemsTotal}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="custos" className="gap-1.5 text-xs">
            <DollarSign className="w-3.5 h-3.5" /> Custos por Vender
          </TabsTrigger>
          <TabsTrigger value="referencias" className="gap-1.5 text-xs">
            <BarChart3 className="w-3.5 h-3.5" /> Referências
          </TabsTrigger>
          <TabsTrigger value="calculadora" className="gap-1.5 text-xs">
            <Calculator className="w-3.5 h-3.5" /> Calculadora
          </TabsTrigger>
        </TabsList>

        <TabsContent value="precos" className="mt-5">
          <PrecosProdutos items={items} loading={loading} isRealData={isRealData} />
        </TabsContent>
        <TabsContent value="custos" className="mt-5">
          <CustosPorVender costs={costs} loading={loading} isRealData={isRealData} />
        </TabsContent>
        <TabsContent value="referencias" className="mt-5">
          <ReferenciasPreccos references={references} loading={loading} isRealData={isRealData} />
        </TabsContent>
        <TabsContent value="calculadora" className="mt-5">
          <Calculadora fetchCosts={fetchCosts} connected={connected} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
