import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/formatters";

interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  app_role: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  orgs: Array<{ id: string; name: string; role: string }>;
}

function initials(name: string | null, email: string | null) {
  const src = name ?? email ?? "?";
  return src
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("super-admin-users", { body: {} });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
      setUsers([]);
    } else {
      setUsers(data?.users ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q) ||
      u.orgs.some((o) => o.name.toLowerCase().includes(q)),
    );
  }, [users, search]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Usuários globais</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Todos os usuários cadastrados no sistema, com suas organizações.
        </p>
      </header>

      <div className="relative mb-4 max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9" />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b border-border">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Usuário</th>
              <th className="px-4 py-2.5 font-medium">Role global</th>
              <th className="px-4 py-2.5 font-medium">Organizações</th>
              <th className="px-4 py-2.5 font-medium">Criado em</th>
              <th className="px-4 py-2.5 font-medium">Último login</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" colSpan={5}><Skeleton className="h-6 w-full" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">Nenhum usuário encontrado.</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        {u.avatar_url && <AvatarImage src={u.avatar_url} alt="" />}
                        <AvatarFallback className="text-[10px]">{initials(u.full_name, u.email)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.full_name || u.email}</div>
                        {u.full_name && <div className="text-xs text-muted-foreground truncate">{u.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.app_role === "admin" ? "default" : "secondary"} className="text-[10px]">
                      {u.app_role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.orgs.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">sem organização</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {u.orgs.map((o) => (
                          <Badge key={o.id} variant="outline" className="text-[10px] font-normal">
                            {o.name} <span className="text-muted-foreground ml-1">· {o.role}</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {u.last_sign_in_at ? formatDate(u.last_sign_in_at) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}