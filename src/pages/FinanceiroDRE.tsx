import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TrendingUp, TrendingDown, DollarSign, Percent, ArrowUpRight, ArrowDownRight, Download, FileSpreadsheet,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from "recharts";
import { dreData, dreMonthlyComparison, formatCurrency } from "@/lib/financial-data";
import { exportDRE, exportDREtoPDF } from "@/lib/export-utils";
import { cn } from "@/lib/utils";

export default function FinanceiroDRE() {
  const [period, setPeriod] = useState("fev2026");

  const receitaLiquida = dreData.find(d => d.label === "= RECEITA LÍQUIDA");
  const lucroBruto = dreData.find(d => d.label === "= LUCRO BRUTO");
  const ebitda = dreData.find(d => d.label === "= RESULTADO OPERACIONAL (EBITDA)");
  const lucroLiquido = dreData.find(d => d.label === "= LUCRO LÍQUIDO DO EXERCÍCIO");

  const margemBruta = receitaLiquida ? ((lucroBruto?.currentMonth ?? 0) / receitaLiquida.currentMonth * 100) : 0;
  const margemLiquida = receitaLiquida ? ((lucroLiquido?.currentMonth ?? 0) / receitaLiquida.currentMonth * 100) : 0;

  const kpis = [
    { label: "Receita Líquida", value: receitaLiquida?.currentMonth ?? 0, prev: receitaLiquida?.previousMonth ?? 0, icon: DollarSign },
    { label: "Lucro Bruto", value: lucroBruto?.currentMonth ?? 0, prev: lucroBruto?.previousMonth ?? 0, icon: TrendingUp },
    { label: "Margem Bruta", value: margemBruta, prev: 0, icon: Percent, isPercent: true },
    { label: "Margem Líquida", value: margemLiquida, prev: 0, icon: Percent, isPercent: true },
  ];

  const getRowStyle = (item: typeof dreData[0]) => {
    if (item.label.startsWith("= LUCRO LÍQUIDO")) return "bg-accent/10 font-bold text-foreground";
    if (item.label.startsWith("=")) return "bg-secondary font-semibold text-foreground";
    if (item.bold) return "font-semibold text-muted-foreground bg-muted/30";
    return "text-foreground";
  };

  const getVariation = (current: number, previous: number) => {
    if (previous === 0) return null;
    return ((current - previous) / Math.abs(previous) * 100).toFixed(1);
  };

  return (
    <div>
      <PageHeader title="DRE" subtitle="Demonstrativo de Resultado do Exercício" />
      <div className="p-8 space-y-8">
        {/* Period selector */}
        <div className="flex items-center justify-between">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 bg-secondary/50 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fev2026">Fevereiro 2026</SelectItem>
              <SelectItem value="jan2026">Janeiro 2026</SelectItem>
              <SelectItem value="dez2025">Dezembro 2025</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportDRE(dreData, period)}>
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportDREtoPDF(dreData, period)}>
              <Download className="w-4 h-4 mr-1.5" />
              PDF
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((item) => {
            const variation = !item.isPercent ? getVariation(item.value, item.prev) : null;
            const positive = variation ? parseFloat(variation) > 0 : item.value > 0;
            return (
              <Card key={item.label} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {item.isPercent ? `${item.value.toFixed(1)}%` : formatCurrency(item.value)}
                  </p>
                  {variation && (
                    <div className="flex items-center gap-1 mt-2">
                      {positive ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                      <span className={cn("text-sm font-medium", positive ? "text-emerald-500" : "text-destructive")}>
                        {variation}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs mês anterior</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart - Monthly comparison */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Evolução do Resultado</CardTitle>
              <p className="text-sm text-muted-foreground">Receita Líquida vs Lucro Líquido (6 meses)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dreMonthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="receitaLiquida" name="Receita Líquida" fill="hsl(217, 70%, 45%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lucLiquido" name="Lucro Líquido" fill="hsl(142, 70%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Area chart - Margins */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Composição do Resultado</CardTitle>
              <p className="text-sm text-muted-foreground">Lucro Bruto, Despesas e Lucro Líquido</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dreMonthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(Math.abs(value))} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="lucBruto" name="Lucro Bruto" stroke="hsl(217, 70%, 45%)" fill="hsl(217, 70%, 45%)" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="lucLiquido" name="Lucro Líquido" stroke="hsl(142, 70%, 45%)" fill="hsl(142, 70%, 45%)" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* DRE Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">DRE Detalhado</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Demonstrativo de Resultado do Exercício — Regime de Competência</p>
              </div>
              <Badge variant="secondary" className="text-xs">Fev/2026</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold w-[45%]">Descrição</TableHead>
                  <TableHead className="font-semibold text-right">Mês Atual</TableHead>
                  <TableHead className="font-semibold text-right">Mês Anterior</TableHead>
                  <TableHead className="font-semibold text-right">Variação</TableHead>
                  <TableHead className="font-semibold text-right">AV%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dreData.map((item, idx) => {
                  const variation = getVariation(item.currentMonth, item.previousMonth);
                  const isPositive = variation ? parseFloat(variation) > 0 : false;
                  const recLiq = receitaLiquida?.currentMonth ?? 1;
                  const av = item.type === "resultado" || item.bold
                    ? ((item.currentMonth / recLiq) * 100).toFixed(1)
                    : ((item.currentMonth / recLiq) * 100).toFixed(1);

                  return (
                    <TableRow key={idx} className={cn("transition-colors", getRowStyle(item))}>
                      <TableCell className={cn("text-sm", item.level === 2 && "pl-8")}>
                        {item.label}
                      </TableCell>
                      <TableCell className={cn("text-right text-sm tabular-nums", item.currentMonth < 0 && "text-destructive")}>
                        {formatCurrency(item.currentMonth)}
                      </TableCell>
                      <TableCell className={cn("text-right text-sm tabular-nums text-muted-foreground", item.previousMonth < 0 && "text-destructive/70")}>
                        {formatCurrency(item.previousMonth)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {variation && item.level !== 0 ? (
                          <span className={cn("inline-flex items-center gap-0.5", isPositive ? "text-emerald-600" : "text-destructive")}>
                            {isPositive ? "+" : ""}{variation}%
                          </span>
                        ) : variation && item.bold ? (
                          <span className={cn("font-semibold", isPositive ? "text-emerald-600" : "text-destructive")}>
                            {isPositive ? "+" : ""}{variation}%
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                        {item.type !== "receita" || item.level === 0 ? `${av}%` : ""}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
