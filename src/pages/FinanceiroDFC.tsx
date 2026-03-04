import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, AlertTriangle, CheckCircle, Download, FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ReferenceLine, ComposedChart, Line,
} from "recharts";
import { dfcData, cashFlowProjection, formatCurrency } from "@/lib/financial-data";
import { exportDFC, exportDFCtoPDF } from "@/lib/export-utils";
import { cn } from "@/lib/utils";

export default function FinanceiroDFC() {
  const [tab, setTab] = useState("dfc");

  // Calculate section totals
  const caixaOperacional = dfcData.find(d => d.label === "= Caixa Gerado nas Operações");
  const caixaInvestimento = dfcData.find(d => d.label === "= Caixa Usado em Investimentos");
  const caixaFinanciamento = dfcData.find(d => d.label === "= Caixa de Financiamentos");
  const variacaoLiquida = dfcData.find(d => d.label === "VARIAÇÃO LÍQUIDA DE CAIXA");
  const saldoFinal = dfcData.find(d => d.label === "SALDO FINAL DE CAIXA");

  // Check projection for danger zones (saldo < 55000)
  const minSaldo = Math.min(...cashFlowProjection.map(d => d.saldo));
  const hasRisk = minSaldo < 55000;

  const kpis = [
    { label: "Saldo Final de Caixa", value: saldoFinal?.currentMonth ?? 0, icon: Wallet, color: "text-accent" },
    { label: "Caixa Operacional", value: caixaOperacional?.currentMonth ?? 0, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Variação Líquida", value: variacaoLiquida?.currentMonth ?? 0, icon: variacaoLiquida && variacaoLiquida.currentMonth >= 0 ? ArrowUpRight : ArrowDownRight, color: variacaoLiquida && variacaoLiquida.currentMonth >= 0 ? "text-emerald-500" : "text-destructive" },
    { label: "Projeção 30 dias", value: minSaldo, icon: hasRisk ? AlertTriangle : CheckCircle, color: hasRisk ? "text-warning" : "text-emerald-500", isAlert: hasRisk },
  ];

  const getSectionColor = (section: string) => {
    switch (section) {
      case "operacional": return "border-l-emerald-500";
      case "investimento": return "border-l-accent";
      case "financiamento": return "border-l-blue-500";
      case "resultado": return "border-l-primary";
      default: return "";
    }
  };

  const getRowStyle = (item: typeof dfcData[0]) => {
    if (item.label === "SALDO FINAL DE CAIXA") return "bg-accent/10 font-bold";
    if (item.label === "VARIAÇÃO LÍQUIDA DE CAIXA") return "bg-secondary font-bold";
    if (item.bold && item.type === "subtotal" && item.currentMonth === 0) return "bg-muted/30 font-semibold text-muted-foreground";
    if (item.bold) return "bg-secondary/50 font-semibold";
    return "";
  };

  // Bar data for DFC overview chart
  const dfcBarData = [
    { name: "Operacional", atual: caixaOperacional?.currentMonth ?? 0, anterior: caixaOperacional?.previousMonth ?? 0 },
    { name: "Investimento", atual: caixaInvestimento?.currentMonth ?? 0, anterior: caixaInvestimento?.previousMonth ?? 0 },
    { name: "Financiamento", atual: caixaFinanciamento?.currentMonth ?? 0, anterior: caixaFinanciamento?.previousMonth ?? 0 },
    { name: "Variação", atual: variacaoLiquida?.currentMonth ?? 0, anterior: variacaoLiquida?.previousMonth ?? 0 },
  ];

  return (
    <div>
      <PageHeader title="DFC e Projeção" subtitle="Demonstrativo de Fluxo de Caixa e projeção futura" />
      <div className="p-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((item) => (
            <Card key={item.label} className={cn("border-0 shadow-md", item.isAlert && "ring-1 ring-warning/30")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <item.icon className={cn("w-5 h-5", item.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(item.value)}</p>
                {item.isAlert && (
                  <p className="text-xs text-warning mt-2 font-medium">⚠ Saldo mínimo projetado abaixo de R$ 55.000</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="dfc">DFC Estruturado</TabsTrigger>
              <TabsTrigger value="projecao">Projeção de Caixa</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportDFC(dfcData, "Fev2026")}>
                <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportDFCtoPDF(dfcData, "Fevereiro 2026")}>
                <Download className="w-4 h-4 mr-1.5" />
                PDF
              </Button>
            </div>
          </div>

          <TabsContent value="dfc" className="space-y-6 mt-6">
            {/* DFC Overview Chart */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Fluxo de Caixa por Atividade</CardTitle>
                <p className="text-sm text-muted-foreground">Comparação mês atual vs anterior</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dfcBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" width={100} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <ReferenceLine x={0} stroke="hsl(217,10%,40%)" strokeWidth={1} />
                    <Bar dataKey="atual" name="Mês Atual" fill="hsl(217, 70%, 45%)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="anterior" name="Mês Anterior" fill="hsl(217, 30%, 75%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* DFC Table */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">DFC Detalhado</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Método Direto — Regime de Caixa</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">Fev/2026</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold w-[50%]">Descrição</TableHead>
                      <TableHead className="font-semibold text-right">Mês Atual</TableHead>
                      <TableHead className="font-semibold text-right">Mês Anterior</TableHead>
                      <TableHead className="font-semibold text-right">Variação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dfcData.filter(d => !(d.type === "subtotal" && d.currentMonth === 0 && d.previousMonth === 0)).map((item, idx) => {
                      const variation = item.previousMonth !== 0
                        ? ((item.currentMonth - item.previousMonth) / Math.abs(item.previousMonth) * 100).toFixed(1)
                        : null;
                      const isPositive = variation ? parseFloat(variation) > 0 : false;

                      // Skip section headers with 0/0
                      if (item.type === "subtotal" && item.currentMonth === 0 && item.previousMonth === 0) return null;

                      return (
                        <TableRow key={idx} className={cn("transition-colors border-l-4", getRowStyle(item), getSectionColor(item.section))}>
                          <TableCell className={cn("text-sm", !item.bold && "pl-8")}>
                            {item.label}
                          </TableCell>
                          <TableCell className={cn("text-right text-sm tabular-nums", item.currentMonth < 0 && "text-destructive")}>
                            {formatCurrency(item.currentMonth)}
                          </TableCell>
                          <TableCell className={cn("text-right text-sm tabular-nums text-muted-foreground", item.previousMonth < 0 && "text-destructive/70")}>
                            {formatCurrency(item.previousMonth)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {variation ? (
                              <span className={cn("font-medium", isPositive ? "text-emerald-600" : "text-destructive")}>
                                {isPositive ? "+" : ""}{variation}%
                              </span>
                            ) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projecao" className="space-y-6 mt-6">
            {/* Projection chart */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Projeção de Fluxo de Caixa</CardTitle>
                    <p className="text-sm text-muted-foreground">Próximos 30 dias — baseado em contas a pagar e receber</p>
                  </div>
                  {hasRisk && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Atenção ao caixa
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={cashFlowProjection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(Math.abs(value))} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <ReferenceLine y={55000} stroke="hsl(38, 92%, 50%)" strokeDasharray="6 3" strokeWidth={2} label={{ value: "Limite mínimo", position: "insideBottomLeft", fill: "hsl(38, 92%, 50%)", fontSize: 11 }} />
                    <Area type="monotone" dataKey="saldo" name="Saldo Projetado" stroke="hsl(217, 70%, 45%)" fill="hsl(217, 70%, 45%)" fillOpacity={0.12} strokeWidth={2.5} />
                    <Bar dataKey="entradas" name="Entradas" fill="hsl(142, 70%, 45%)" opacity={0.7} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="hsl(0, 72%, 51%)" opacity={0.5} radius={[3, 3, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Projection table */}
            <Card className="border-0 shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">Detalhamento da Projeção</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold">Data</TableHead>
                      <TableHead className="font-semibold text-right">Entradas</TableHead>
                      <TableHead className="font-semibold text-right">Saídas</TableHead>
                      <TableHead className="font-semibold text-right">Saldo Projetado</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashFlowProjection.map((item, idx) => {
                      const isLow = item.saldo < 55000;
                      return (
                        <TableRow key={idx} className={cn("transition-colors", isLow && "bg-warning/5")}>
                          <TableCell className="text-sm font-medium">{item.date}</TableCell>
                          <TableCell className="text-right text-sm text-emerald-600 tabular-nums">
                            +{formatCurrency(item.entradas)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-destructive tabular-nums">
                            {formatCurrency(item.saidas)}
                          </TableCell>
                          <TableCell className={cn("text-right text-sm font-semibold tabular-nums", isLow && "text-warning")}>
                            {formatCurrency(item.saldo)}
                          </TableCell>
                          <TableCell className="text-center">
                            {isLow ? (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Baixo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                OK
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
