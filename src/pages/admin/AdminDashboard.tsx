import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Link2, Store, UsersRound } from "lucide-react";

interface Stats {
  orgs: number;
  users: number;
  memberships: number;
  sellers: number;
  ml_connections: number;
}

const tiles: Array<{ key: keyof Stats; label: string; icon: any }> = [
  { key: "orgs", label: "Organizações", icon: Building2 },
  { key: "users", label: "Usuários cadastrados", icon: Users },
  { key: "memberships", label: "Vínculos org/usuário", icon: UsersRound },
  { key: "sellers", label: "Sellers", icon: Store },
  { key: "ml_connections", label: "Conexões Mercado Livre", icon: Link2 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase.functions
      .invoke("super-admin-orgs", { body: { action: "stats" } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message ?? "Erro ao carregar estatísticas");
        else setStats(data?.stats ?? null);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Métricas gerais do sistema (cross-organização).
        </p>
      </header>

      {error && (
        <Card className="p-4 mb-4 border-destructive/40 bg-destructive/5 text-destructive text-sm">
          {error}
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Card key={t.key} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">{t.label}</div>
              <t.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-semibold tracking-tight">
                {stats?.[t.key]?.toLocaleString("pt-BR") ?? "—"}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-5 mt-6">
        <h2 className="text-sm font-medium mb-1">Próximos passos</h2>
        <p className="text-sm text-muted-foreground">
          A Fase 1 do painel admin cobre organizações e usuários globais.
          Assinaturas, integrações globais e feature flags virão em fases futuras.
        </p>
      </Card>
    </div>
  );
}