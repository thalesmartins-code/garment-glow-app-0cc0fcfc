import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { TopProducts } from "@/components/dashboard/TopProducts";

const metrics = [
  {
    title: "Vendas do Mês",
    value: "R$ 24.580",
    change: { value: "12%", positive: true },
    icon: DollarSign,
    variant: "accent" as const,
  },
  {
    title: "Pedidos Hoje",
    value: "48",
    change: { value: "8%", positive: true },
    icon: ShoppingBag,
    variant: "default" as const,
  },
  {
    title: "Produtos em Estoque",
    value: "1.284",
    change: { value: "3%", positive: false },
    icon: Package,
    variant: "default" as const,
  },
  {
    title: "Taxa de Conversão",
    value: "3.2%",
    change: { value: "0.5%", positive: true },
    icon: TrendingUp,
    variant: "default" as const,
  },
];

const Index = () => {
  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Bem-vinda de volta, Julia! Aqui está o resumo da sua loja."
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            variant={metric.variant}
          />
        ))}
      </div>

      {/* Charts and Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SalesChart />
        <RecentSales />
        <TopProducts />
        <div className="lg:col-span-2" />
      </div>
    </DashboardLayout>
  );
};

export default Index;
