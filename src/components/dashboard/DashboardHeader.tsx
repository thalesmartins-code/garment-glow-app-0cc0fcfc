import { BarChart3 } from "lucide-react";

interface DashboardHeaderProps {
  period: string;
  sellerName?: string;
}

export function DashboardHeader({ period, sellerName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Dashboard de Vendas
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {sellerName && <span className="font-medium text-foreground">{sellerName}</span>}
            {sellerName && " • "}
            Monitoramento de performance por marketplace • {period}
          </p>
        </div>
      </div>
    </div>
  );
}
