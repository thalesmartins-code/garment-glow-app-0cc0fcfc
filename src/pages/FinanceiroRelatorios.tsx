import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from "recharts";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  mockTransactions, mockReceivables, monthlyData,
  paymentMethodDistribution, formatCurrency,
} from "@/lib/financial-data";
import { TrendingUp, TrendingDown, AlertTriangle, CreditCard, BarChart3, FileText } from "lucide-react";

// Extended mock data for reports
const salesByPaymentMethod = [
  { method: "Cartão Crédito", total: 29760, qty: 42, avgTicket: 708.57, share: 38 },
  { method: "Pix", total: 19575, qty: 68, avgTicket: 287.87, share: 25 },
  { method: "Dinheiro", total: 11745, qty: 35, avgTicket: 335.57, share: 15 },
  { method: "Cartão Débito", total: 9396, qty: 28, avgTicket: 335.57, share: 12 },
  { method: "Crediário", total: 7830, qty: 15, avgTicket: 522.00, share: 10 },
];

const delinquencyByMonth = [
  { month: "Set", totalVencido: 2800, totalCarteira: 18500, taxa: 15.1 },
  { month: "Out", totalVencido: 3200, totalCarteira: 21200, taxa: 15.1 },
  { month: "Nov", totalVencido: 2100, totalCarteira: 24500, taxa: 8.6 },
  { month: "Dez", totalVencido: 4800, totalCarteira: 32000, taxa: 15.0 },
  { month: "Jan", totalVencido: 3500, totalCarteira: 19800, taxa: 17.7 },
  { month: "Fev", totalVencido: 2470, totalCarteira: 22100, taxa: 11.2 },
];

const revenueVsExpenseDetailed = [
  { month: "Set", receitas: 68500, despesas: 42300, lucro: 26200, margem: 38.2 },
  { month: "Out", receitas: 72100, despesas: 45800, lucro: 26300, margem: 36.5 },
  { month: "Nov", receitas: 89400, despesas: 51200, lucro: 38200, margem: 42.7 },
  { month: "Dez", receitas: 125600, despesas: 68900, lucro: 56700, margem: 45.1 },
  { month: "Jan", receitas: 54200, despesas: 39100, lucro: 15100, margem: 27.9 },
  { month: "Fev", receitas: 78300, despesas: 44600, lucro: 33700, margem: 43.0 },
];

const CHART_COLORS = [
  "hsl(217, 70%, 45%)",
  "hsl(142, 70%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(350, 50%, 60%)",
  "hsl(24, 10%, 40%)",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {typeof entry.value === "number" && entry.value > 100
            ? formatCurrency(entry.value)
            : `${entry.value}%`}
        </p>
      ))}
    </div>
  );
};

function SummaryCards() {
  const totalReceitas = revenueVsExpenseDetailed.reduce((s, m) => s + m.receitas, 0);
  const totalDespesas = revenueVsExpenseDetailed.reduce((s, m) => s + m.despesas, 0);
  const margemMedia = ((totalReceitas - totalDespesas) / totalReceitas * 100).toFixed(1);
  const inadimplenciaAtual = delinquencyByMonth[delinquencyByMonth.length - 1];

  const cards = [
    { label: "Receita Total (6m)", value: formatCurrency(totalReceitas), icon: TrendingUp, color: "text-emerald-600" },
    { label: "Despesa Total (6m)", value: formatCurrency(totalDespesas), icon: TrendingDown, color: "text-red-500" },
    { label: "Margem Média", value: `${margemMedia}%`, icon: BarChart3, color: "text-accent" },
    { label: "Inadimplência Atual", value: `${inadimplenciaAtual.taxa}%`, icon: AlertTriangle, color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="border-0 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg bg-secondary ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-bold text-foreground">{c.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RankingVendas() {
  const totalGeral = salesByPaymentMethod.reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent" />
              Distribuição por Forma de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                          <p className="font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.value}% das vendas</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-accent" />
              Volume por Forma de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByPaymentMethod} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                  <XAxis type="number" tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} fontSize={11} />
                  <YAxis type="category" dataKey="method" width={100} fontSize={11} />
                  <Tooltip content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                        <p className="font-medium">{d.method}</p>
                        <p className="text-xs">Total: {formatCurrency(d.total)}</p>
                        <p className="text-xs text-muted-foreground">{d.qty} vendas · Ticket médio: {formatCurrency(d.avgTicket)}</p>
                      </div>
                    );
                  }} />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} fill="hsl(217, 70%, 45%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Ranking Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead className="text-right">Qtd. Vendas</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Participação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesByPaymentMethod.map((row, i) => (
                <TableRow key={row.method}>
                  <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{row.method}</TableCell>
                  <TableCell className="text-right">{row.qty}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.avgTicket)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(row.total)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="font-mono">{row.share}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-secondary/30 font-bold">
                <TableCell />
                <TableCell>Total</TableCell>
                <TableCell className="text-right">{salesByPaymentMethod.reduce((s, r) => s + r.qty, 0)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalGeral / salesByPaymentMethod.reduce((s, r) => s + r.qty, 0))}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totalGeral)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="default" className="font-mono">100%</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function AnaliseInadimplencia() {
  const vencidos = mockReceivables.filter(r => r.status === "vencido");
  const renegociados = mockReceivables.filter(r => r.status === "renegociado");
  const totalVencido = vencidos.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Títulos Vencidos</p>
            <p className="text-2xl font-bold text-destructive">{vencidos.length}</p>
            <p className="text-sm text-muted-foreground mt-1">{formatCurrency(totalVencido)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Renegociados</p>
            <p className="text-2xl font-bold text-accent">{renegociados.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(renegociados.reduce((s, r) => s + r.amount, 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Taxa Inadimplência Atual</p>
            <p className="text-2xl font-bold text-amber-500">
              {delinquencyByMonth[delinquencyByMonth.length - 1].taxa}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">da carteira de crediário</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taxa de inadimplência ao longo do tempo */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Evolução da Inadimplência (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={delinquencyByMonth}>
                  <defs>
                    <linearGradient id="gradInadimplencia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(350, 50%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(350, 50%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis unit="%" fontSize={11} />
                  <Tooltip content={CustomTooltip} />
                  <Area
                    type="monotone"
                    dataKey="taxa"
                    name="Taxa"
                    stroke="hsl(350, 50%, 60%)"
                    fill="url(#gradInadimplencia)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Valores vencidos vs carteira */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Carteira vs Vencidos (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={delinquencyByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={11} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                        <p className="font-medium mb-1">{label}</p>
                        {payload.map((e: any, i: number) => (
                          <p key={i} className="text-xs" style={{ color: e.color }}>
                            {e.name}: {formatCurrency(e.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }} />
                  <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                  <Bar dataKey="totalCarteira" name="Carteira" fill="hsl(217, 70%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalVencido" name="Vencido" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhe dos vencidos */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Clientes Inadimplentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...vencidos, ...renegociados].map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.clientName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.description}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(r.amount)}</TableCell>
                  <TableCell className="text-sm">{new Date(r.dueDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "vencido" ? "destructive" : "secondary"}>
                      {r.status === "vencido" ? "Vencido" : "Renegociado"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ReceitaVsDespesa() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area chart receita vs despesa */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Receitas vs Despesas (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueVsExpenseDetailed}>
                  <defs>
                    <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={11} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                        <p className="font-medium mb-1">{label}</p>
                        {payload.map((e: any, i: number) => (
                          <p key={i} className="text-xs" style={{ color: e.color }}>
                            {e.name}: {formatCurrency(e.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }} />
                  <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                  <Area type="monotone" dataKey="receitas" name="Receitas" stroke="hsl(142, 70%, 45%)" fill="url(#gradReceita)" strokeWidth={2} />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="hsl(0, 72%, 51%)" fill="url(#gradDespesa)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lucro + Margem */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lucro e Margem (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueVsExpenseDetailed}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" unit="%" fontSize={11} />
                  <Tooltip content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                        <p className="font-medium mb-1">{label}</p>
                        {payload.map((e: any, i: number) => (
                          <p key={i} className="text-xs" style={{ color: e.color }}>
                            {e.name}: {e.name === "Margem" ? `${e.value}%` : formatCurrency(e.value)}
                          </p>
                        ))}
                      </div>
                    );
                  }} />
                  <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                  <Bar yAxisId="left" dataKey="lucro" name="Lucro" fill="hsl(217, 70%, 45%)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="margem" name="Margem" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table mensal */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Resumo Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead className="text-right">Receitas</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
                <TableHead className="text-right">Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueVsExpenseDetailed.map((row) => (
                <TableRow key={row.month}>
                  <TableCell className="font-medium">{row.month}/2026</TableCell>
                  <TableCell className="text-right text-emerald-600">{formatCurrency(row.receitas)}</TableCell>
                  <TableCell className="text-right text-red-500">{formatCurrency(row.despesas)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(row.lucro)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={row.margem >= 40 ? "default" : "secondary"} className="font-mono">
                      {row.margem}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FinanceiroRelatorios() {
  return (
    <div>
      <PageHeader title="Relatórios Gerenciais" subtitle="Análises de vendas, inadimplência e resultados" />
      <div className="p-6 space-y-6">
        <SummaryCards />

        <Tabs defaultValue="vendas" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="vendas" className="gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              Vendas por Pagamento
            </TabsTrigger>
            <TabsTrigger value="inadimplencia" className="gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Inadimplência
            </TabsTrigger>
            <TabsTrigger value="resultado" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Receita vs Despesa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vendas">
            <RankingVendas />
          </TabsContent>
          <TabsContent value="inadimplencia">
            <AnaliseInadimplencia />
          </TabsContent>
          <TabsContent value="resultado">
            <ReceitaVsDespesa />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
