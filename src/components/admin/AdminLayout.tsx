import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Users, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/admin/organizacoes", label: "Organizações", icon: Building2 },
  { to: "/admin/usuarios", label: "Usuários globais", icon: Users },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        <div className="px-5 py-5 border-b border-border flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-semibold leading-tight">Super Admin</div>
            <div className="text-[11px] text-muted-foreground leading-tight">Painel do sistema</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start">
            <NavLink to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao app
            </NavLink>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={signOut}>
            Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}