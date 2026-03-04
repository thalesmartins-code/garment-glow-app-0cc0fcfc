import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { month: "Jan", vendas: 4200 },
  { month: "Fev", vendas: 3800 },
  { month: "Mar", vendas: 5100 },
  { month: "Abr", vendas: 4600 },
  { month: "Mai", vendas: 5400 },
  { month: "Jun", vendas: 6200 },
  { month: "Jul", vendas: 5800 },
];

export function SalesChart() {
  return (
    <Card className="col-span-full lg:col-span-2 border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Vendas Mensais
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Acompanhe a evolução das vendas ao longo do ano
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(15 45% 65%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(15 45% 65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(24 5% 45%)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(24 5% 45%)" }}
                tickFormatter={(value) => `R$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(30 15% 90%)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px -1px hsl(24 10% 10% / 0.1)",
                }}
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString("pt-BR")}`,
                  "Vendas",
                ]}
              />
              <Area
                type="monotone"
                dataKey="vendas"
                stroke="hsl(15 45% 65%)"
                strokeWidth={2}
                fill="url(#colorVendas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
