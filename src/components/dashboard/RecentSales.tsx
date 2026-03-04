import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentSales = [
  {
    id: 1,
    customer: "Ana Oliveira",
    product: "Vestido Floral",
    amount: "R$ 289,90",
    status: "completed",
    time: "há 5 min",
  },
  {
    id: 2,
    customer: "Carlos Silva",
    product: "Camisa Social",
    amount: "R$ 159,90",
    status: "completed",
    time: "há 12 min",
  },
  {
    id: 3,
    customer: "Maria Santos",
    product: "Calça Jeans",
    amount: "R$ 199,90",
    status: "pending",
    time: "há 25 min",
  },
  {
    id: 4,
    customer: "Pedro Costa",
    product: "Blazer Slim",
    amount: "R$ 459,90",
    status: "completed",
    time: "há 1 hora",
  },
  {
    id: 5,
    customer: "Lucia Ferreira",
    product: "Saia Midi",
    amount: "R$ 179,90",
    status: "completed",
    time: "há 2 horas",
  },
];

export function RecentSales() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Vendas Recentes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Últimas transações realizadas
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentSales.map((sale) => (
          <div
            key={sale.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                {sale.customer
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-medium text-sm">{sale.customer}</p>
                <p className="text-xs text-muted-foreground">{sale.product}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{sale.amount}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={sale.status === "completed" ? "default" : "secondary"}
                  className={
                    sale.status === "completed"
                      ? "bg-success/10 text-success hover:bg-success/20 border-0"
                      : "bg-warning/10 text-warning hover:bg-warning/20 border-0"
                  }
                >
                  {sale.status === "completed" ? "Concluída" : "Pendente"}
                </Badge>
                <span className="text-xs text-muted-foreground">{sale.time}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
