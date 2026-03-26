import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FileSpreadsheet, Store, LogOut, AreaChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const environments = [
  {
    id: "sheets",
    title: "Google Sheets",
    description: "Dashboard, Vendas, Importação, Sellers e Usuários",
    icon: FileSpreadsheet,
    path: "/sheets",
    gradient: "from-emerald-600 to-teal-500",
    shadow: "hover:shadow-[0_8px_30px_hsl(142_70%_45%/0.25)]",
  },
  {
    id: "mercado-livre",
    title: "Mercado Livre",
    description: "Vendas, Estoque, Anúncios, Pedidos, Publicidade e Integrações",
    icon: Store,
    path: "/mercado-livre",
    gradient: "from-yellow-500 to-amber-500",
    shadow: "hover:shadow-[0_8px_30px_hsl(38_92%_50%/0.25)]",
  },
];

export default function AppSelector() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <AreaChart className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Analytics Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user?.email}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Selecione o ambiente</h1>
            <p className="text-muted-foreground">
              Escolha o módulo que deseja acessar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {environments.map((env) => {
              const Icon = env.icon;
              return (
                <button
                  key={env.id}
                  onClick={() => navigate(env.path)}
                  className={`group relative flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1 ${env.shadow}`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${env.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-semibold">{env.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {env.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
