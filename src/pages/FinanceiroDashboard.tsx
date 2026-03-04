import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  
} from "recharts";
import {
  mockTransactions,
  monthlyData,
  paymentMethodDistribution,
  formatCurrency,
  getStatusColor,
  getStatusLabel,
} from "@/lib/financial-data";

const kpiDataCompetencia = {
  receitaBruta: 78300,
  despesas: 44600,
  lucroLiquido: 33700,
  saldoCaixa: 77631.15,
};

const kpiDataCaixa = {
  receitaBruta: 62100,
  despesas: 44600,
  lucroLiquido: 17500,
  saldoCaixa: 77631.15,
};

export default function FinanceiroDashboard() {
  const [visao, setVisao] = useState<"competencia" | "caixa">("competencia");
  const kpi = visao === "competencia" ? kpiDataCompetencia : kpiDataCaixa;

  const kpis = [
    { label: "Receita Bruta", value: kpi.receitaBruta, icon: TrendingUp, trend: "+12.5%", positive: true },
    { label: "Despesas", value: kpi.despesas, icon: TrendingDown, trend: "+3.2%", positive: false },
    { label: "Lucro Líquido", value: kpi.lucroLiquido, icon: DollarSign, trend: "+18.1%", positive: true },
    { label: "Saldo em Caixa", value: kpi.saldoCaixa, icon: Wallet, trend: null, positive: true },
  ];

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Visão geral financeira da loja" />
      <div className="p-8 space-y-8">
        {/* Toggle */}
        <Tabs value={visao} onValueChange={(v) => setVisao(v as "competencia" | "caixa")}>
          <TabsList>
            <TabsTrigger value="competencia">Competência</TabsTrigger>
            <TabsTrigger value="caixa">Caixa</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((item) => (
            <Card key={item.label} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(item.value)}</p>
                {item.trend && (
                  <div className="flex items-center gap-1 mt-2">
                    {item.positive ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${item.positive ? "text-emerald-500" : "text-red-500"}`}>
                      {item.trend}
                    </span>
                    <span className="text-xs text-muted-foreground">vs mês anterior</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(217,5%,45%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="receitas" stroke="hsl(142,70%,45%)" fill="hsl(142,70%,45%)" fillOpacity={0.15} strokeWidth={2} name="Receitas" />
                  <Area type="monotone" dataKey="despesas" stroke="hsl(0,72%,51%)" fill="hsl(0,72%,51%)" fillOpacity={0.1} strokeWidth={2} name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Forma de Pagamento</CardTitle>
              <p className="text-sm text-muted-foreground">Distribuição por método utilizado</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-[140px] h-[140px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentMethodDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                        {paymentMethodDistribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5">
                  {paymentMethodDistribution.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between py-1.5 px-3 rounded-lg" style={{ backgroundColor: `${entry.fill}15` }}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.fill }} />
                        <span className="text-sm font-medium">{entry.name}</span>
                      </div>
                      <span className="text-sm font-bold">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent transactions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTransactions.slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === "receita" ? "bg-emerald-100" : "bg-red-100"}`}>
                      {t.type === "receita" ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.date} · {t.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${t.type === "receita" ? "text-emerald-600" : "text-red-600"}`}>
                      {t.type === "receita" ? "+" : "-"}{formatCurrency(t.amount)}
                    </p>
                    <Badge variant="secondary" className={`text-[10px] ${getStatusColor(t.status)}`}>
                      {getStatusLabel(t.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
