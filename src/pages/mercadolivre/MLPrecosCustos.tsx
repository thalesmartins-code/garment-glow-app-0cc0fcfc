import { useState, useCallback } from "react";
import {
  DollarSign, Tag, Calculator, BarChart3, Plug, RefreshCw,
  TrendingUp, TrendingDown, Package, Truck, Info, ChevronDown, ChevronUp,
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
import { useMLStore } from "@/contexts/MLStoreContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── Helpers ────────────────────────────────────────────────────────────────

const currFmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const pctFmt = (v: number) => `${v.toFixed(1)}%`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface ItemPrice {
  item_id: string;
  title: string;
  thumbnail: string;
  price_standard: number;
  price_promo: number | null;
  currency_id: string;
  listing_type: string;
  last_updated: string;
}

interface ListingCost {
  listing_type_id: string;
  listing_type_name: string;
  listing_exposure: string;
  sale_fee_amount: number;
  percentage_fee: number;
  fixed_fee: number;
  financing_add_on_fee: number;
}

interface PriceReference {
  category_id: string;
  category_name: string;
  listing_type_id: string;
  price: number;
  sale_fee_amount: number;
  percentage_fee: number;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_ITEM_PRICES: ItemPrice[] = [
  {
    item_id: "MLB1001",
    title: "Camiseta Básica Preta P",
    thumbnail: "",
    price_standard: 89.9,
    price_promo: 69.9,
    currency_id: "BRL",
    listing_type: "gold_pro",
    last_updated: "2026-04-10T14:00:00Z",
  },
  {
    item_id: "MLB1002",
    title: "Calça Jeans Slim 40",
    thumbnail: "",
    price_standard: 189.9,
    price_promo: null,
    currency_id: "BRL",
    listing_type: "gold_special",
    last_updated: "2026-04-09T10:30:00Z",
  },
  {
    item_id: "MLB1003",
    title: "Vestido Floral M",
    thumbnail: "",
    price_standard: 129.9,
    price_promo: 99.9,
    currency_id: "BRL",
    listing_type: "gold_pro",
    last_updated: "2026-04-11T08:00:00Z",
  },
  {
    item_id: "MLB1004",
    title: "Tênis Esportivo 38",
    thumbnail: "",
    price_standard: 259.9,
    price_promo: null,
    currency_id: "BRL",
    listing_type: "gold_pro",
    last_updated: "2026-04-08T16:45:00Z",
  },
  {
    item_id: "MLB1005",
    title: "Blusa Cropped Branca G",
    thumbnail: "",
    price_standard: 59.9,
    price_promo: 49.9,
    currency_id: "BRL",
    listing_type: "gold_special",
    last_updated: "2026-04-12T09:15:00Z",
  },
];

const MOCK_LISTING_COSTS: ListingCost[] = [
  {
    listing_type_id: "gold_pro",
    listing_type_name: "Premium",
    listing_exposure: "Máxima",
    sale_fee_amount: 0,
    percentage_fee: 16,
    fixed_fee: 6,
    financing_add_on_fee: 23,
  },
  {
    listing_type_id: "gold_special",
    listing_type_name: "Clássica",
    listing_exposure: "Alta",
    sale_fee_amount: 0,
    percentage_fee: 12,
    fixed_fee: 6,
    financing_add_on_fee: 0,
  },
  {
    listing_type_id: "free",
    listing_type_name: "Gratuita",
    listing_exposure: "Baixa",
    sale_fee_amount: 0,
    percentage_fee: 0,
    fixed_fee: 0,
    financing_add_on_fee: 0,
  },
];

const MOCK_PRICE_REFS: PriceReference[] = [
  {
    category_id: "MLB12341",
    category_name: "Camisetas",
    listing_type_id: "gold_pro",
    price: 89.9,
    sale_fee_amount: 20.38,
    percentage_fee: 16,
  },
  {
    category_id: "MLB12342",
    category_name: "Calças",
    listing_type_id: "gold_pro",
    price: 189.9,
    sale_fee_amount: 36.22,
    percentage_fee: 16,
  },
  {
    category_id: "MLB12343",
    category_name: "Vestidos",
    listing_type_id: "gold_special",
    price: 129.9,
    sale_fee_amount: 21.58,
    percentage_fee: 12,
  },
  {
    category_id: "MLB12344",
    category_name: "Calçados",
    listing_type_id: "gold_pro",
    price: 259.9,
    sale_fee_amount: 47.58,
    percentage_fee: 16,
  },
];

// ─── Not Connected ────────────────────────────────────────────────────────────

function NotConnected() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Plug className="w-16 h-16 text-muted-foreground/40" />
      <h2 className="text-xl font-semibold">Mercado Livre não conectado</h2>
      <p className="text-muted-foreground text-sm">Conecte sua conta para acessar preços e custos.</p>
      <Button asChild><Link to="/api/integracoes">Conectar conta</Link></Button>
    </div>
  );
}

// ─── Tab: Preços de Produtos ──────────────────────────────────────────────────

function PrecosProdutos() {
  const [search, setSearch] = useState("");
  const [loading] = useState(false);

  const filtered = MOCK_ITEM_PRICES.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.item_id.toLowerCase().includes(search.toLowerCase())
  );

  const listingTypeBadge = (type: string) => {
    if (type === "gold_pro") return <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30">Premium</Badge>;
    if (type === "gold_special") return <Badge className="bg-blue-500/15 text-blue-700 border-blue-500/30">Clássica</Badge>;
    return <Badge variant="outline">Gratuita</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Buscar por título ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-3"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Sincronizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Preços dos Anúncios</CardTitle>
          <CardDescription className="text-xs">
            Preços standard e promocionais dos seus produtos ativos.
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
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16 mx-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24 ml-auto" /></td>
                      </tr>
                    ))
                  : filtered.map((item) => (
                      <tr key={item.item_id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground leading-tight">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.item_id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {currFmt(item.price_standard)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {item.price_promo ? (
                            <span className="text-emerald-600 font-medium">{currFmt(item.price_promo)}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{listingTypeBadge(item.listing_type)}</td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {new Date(item.last_updated).toLocaleDateString("pt-BR")}
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

// ─── Tab: Custos por Vender ───────────────────────────────────────────────────

function CustosPorVender() {
  const chartData = MOCK_LISTING_COSTS.filter((c) => c.percentage_fee > 0).map((c) => ({
    name: c.listing_type_name,
    comissao: c.percentage_fee,
    fixo: c.fixed_fee,
    parcelamento: c.financing_add_on_fee,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MOCK_LISTING_COSTS.map((cost) => (
          <Card key={cost.listing_type_id} className="relative overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{cost.listing_type_name}</CardTitle>
                <Badge variant="outline" className="text-xs">{cost.listing_exposure}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground text-xs">Comissão por venda</span>
                <span className="font-semibold text-foreground">{pctFmt(cost.percentage_fee)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground text-xs">Taxa fixa</span>
                <span className="font-medium">{cost.fixed_fee > 0 ? currFmt(cost.fixed_fee) : "Grátis"}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  Parcelamento
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3 h-3" /></TooltipTrigger>
                    <TooltipContent>Taxa adicional quando o comprador parcela a compra</TooltipContent>
                  </Tooltip>
                </span>
                <span className="font-medium">
                  {cost.financing_add_on_fee > 0 ? `+${pctFmt(cost.financing_add_on_fee)}` : "—"}
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Comparativo de Comissões por Tipo de Anúncio</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <RechartsTooltip
                formatter={(v: number, name: string) => {
                  const labels: Record<string, string> = {
                    comissao: "Comissão",
                    fixo: "Taxa Fixa (R$)",
                    parcelamento: "Parcelamento",
                  };
                  return [`${v}%`, labels[name] ?? name];
                }}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="comissao" name="comissao" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#f59e0b" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-4 pb-3 px-4">
          <div className="flex items-start gap-2 text-sm text-amber-700">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Os custos de envio variam conforme o tipo de logística (Drop Off, Coleta, Full) e o peso
              faturável do produto. Use a aba <strong>Calculadora</strong> para simular o custo total por venda.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Referências de Preços ───────────────────────────────────────────────

function ReferenciasPreccos() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Custos por Categoria</CardTitle>
          <CardDescription className="text-xs">
            Comissão calculada pela API do Mercado Livre com base no preço e categoria de cada produto.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Categoria</th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Preço ref.</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Comissão %</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Custo total</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Líquido</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRICE_REFS.map((ref) => {
                  const liquido = ref.price - ref.sale_fee_amount;
                  return (
                    <tr key={ref.category_id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{ref.category_name}</p>
                        <p className="text-xs text-muted-foreground">{ref.category_id}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="text-xs">
                          {ref.listing_type_id === "gold_pro" ? "Premium" : "Clássica"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        {currFmt(ref.price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-destructive font-medium">{pctFmt(ref.percentage_fee)}</span>
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Receita Líquida por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={MOCK_PRICE_REFS.map((r) => ({
                name: r.category_name,
                liquido: parseFloat((r.price - r.sale_fee_amount).toFixed(2)),
                comissao: parseFloat(r.sale_fee_amount.toFixed(2)),
              }))}
              barSize={32}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <RechartsTooltip
                formatter={(v: number, name: string) => [
                  currFmt(v),
                  name === "liquido" ? "Líquido" : "Comissão",
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="liquido" name="liquido" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comissao" name="comissao" stackId="a" fill="#f87171" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Calculadora ─────────────────────────────────────────────────────────

interface CalcResult {
  listing_type: string;
  listing_name: string;
  sale_price: number;
  commission_pct: number;
  commission_value: number;
  fixed_fee: number;
  shipping_cost: number;
  total_cost: number;
  net_revenue: number;
  margin_pct: number;
}

const LOGISTIC_COSTS: Record<string, number> = {
  fulfillment: 8.5,
  drop_off: 6.0,
  self_service: 5.0,
  custom: 0,
};

const LOGISTIC_LABELS: Record<string, string> = {
  fulfillment: "Full (Fulfillment)",
  drop_off: "Drop Off",
  self_service: "Flex",
  custom: "Envio próprio",
};

function Calculadora() {
  const [productCost, setProductCost] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [logisticType, setLogisticType] = useState("drop_off");
  const [results, setResults] = useState<CalcResult[] | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const calculate = useCallback(() => {
    const cost = parseFloat(productCost.replace(",", ".")) || 0;
    const price = parseFloat(salePrice.replace(",", ".")) || 0;
    if (price <= 0) return;

    const shippingCost = LOGISTIC_COSTS[logisticType] ?? 0;

    const listing_types = [
      { id: "gold_pro", name: "Premium", pct: 16, fixed: 6 },
      { id: "gold_special", name: "Clássica", pct: 12, fixed: 6 },
      { id: "free", name: "Gratuita", pct: 0, fixed: 0 },
    ];

    const calc: CalcResult[] = listing_types.map((lt) => {
      const commission_value = price * (lt.pct / 100);
      const total_cost = cost + commission_value + lt.fixed + shippingCost;
      const net_revenue = price - commission_value - lt.fixed - shippingCost;
      const margin_pct = price > 0 ? ((net_revenue - cost) / price) * 100 : 0;
      return {
        listing_type: lt.id,
        listing_name: lt.name,
        sale_price: price,
        commission_pct: lt.pct,
        commission_value,
        fixed_fee: lt.fixed,
        shipping_cost: shippingCost,
        total_cost,
        net_revenue,
        margin_pct,
      };
    });

    setResults(calc);
  }, [productCost, salePrice, logisticType]);

  const marginColor = (pct: number) => {
    if (pct >= 20) return "text-emerald-600";
    if (pct >= 10) return "text-amber-600";
    return "text-destructive";
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Simulador de Precificação
          </CardTitle>
          <CardDescription className="text-xs">
            Calcule sua margem e o custo real por venda antes de publicar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <Label className="text-xs">Tipo de logística</Label>
              <Select value={logisticType} onValueChange={setLogisticType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOGISTIC_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculate} className="w-full sm:w-auto gap-1.5">
            <Calculator className="w-4 h-4" /> Calcular
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Resultado por tipo de anúncio</p>
          {results.map((r) => (
            <Card
              key={r.listing_type}
              className={r.listing_type === "gold_pro" ? "border-yellow-500/40" : ""}
            >
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{r.listing_name}</span>
                    {r.listing_type === "gold_pro" && (
                      <Badge className="bg-yellow-500/15 text-yellow-700 border-yellow-500/30 text-xs">Recomendado</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Lucro líquido</p>
                      <p className={`font-bold text-sm tabular-nums ${marginColor(r.margin_pct)}`}>
                        {currFmt(r.net_revenue - parseFloat(productCost.replace(",", ".") || "0"))}
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
                      onClick={() => setShowDetail(showDetail === r.listing_type ? null : r.listing_type)}
                    >
                      {showDetail === r.listing_type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {showDetail === r.listing_type && (
                  <div className="mt-3 pt-3 border-t space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Preço de venda</span>
                      <span className="tabular-nums font-medium">{currFmt(r.sale_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Comissão ({pctFmt(r.commission_pct)})</span>
                      <span className="tabular-nums text-destructive">-{currFmt(r.commission_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">Taxa fixa</span>
                      <span className="tabular-nums text-destructive">-{currFmt(r.fixed_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs">
                        Envio ({LOGISTIC_LABELS[logisticType]})
                      </span>
                      <span className="tabular-nums text-destructive">-{currFmt(r.shipping_cost)}</span>
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
                        {currFmt(r.net_revenue - parseFloat(productCost.replace(",", ".") || "0"))}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comparativo Visual de Margem</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={results.filter((r) => r.commission_pct > 0).map((r) => ({
                    name: r.listing_name,
                    margem: parseFloat(r.margin_pct.toFixed(1)),
                  }))}
                  barSize={40}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <RechartsTooltip formatter={(v: number) => [`${v}%`, "Margem"]} contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="margem" name="Margem" radius={[4, 4, 0, 0]}>
                    {results.filter((r) => r.commission_pct > 0).map((r, i) => (
                      <Cell key={i} fill={r.margin_pct >= 20 ? "#22c55e" : r.margin_pct >= 10 ? "#f59e0b" : "#ef4444"} />
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MLPrecosCustos() {
  const { stores } = useMLStore();

  if (!stores || stores.length === 0) {
    return (
      <div className="space-y-6">
        <MLPageHeader title="Preços e Custos" lastUpdated={null} />
        <NotConnected />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MLPageHeader title="Preços e Custos" lastUpdated={null} />

      <Tabs defaultValue="precos">
        <TabsList className="h-9">
          <TabsTrigger value="precos" className="gap-1.5 text-xs">
            <Tag className="w-3.5 h-3.5" /> Preços de Produtos
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
          <PrecosProdutos />
        </TabsContent>
        <TabsContent value="custos" className="mt-5">
          <CustosPorVender />
        </TabsContent>
        <TabsContent value="referencias" className="mt-5">
          <ReferenciasPreccos />
        </TabsContent>
        <TabsContent value="calculadora" className="mt-5">
          <Calculadora />
        </TabsContent>
      </Tabs>
    </div>
  );
}
