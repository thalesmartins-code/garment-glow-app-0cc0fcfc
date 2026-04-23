import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await anonClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Acesso negado: requer super admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: list, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) throw error;

    const userIds = list.users.map((u) => u.id);

    const [rolesRes, profilesRes, membersRes] = await Promise.all([
      adminClient.from("user_roles").select("user_id, role").in("user_id", userIds),
      adminClient.from("profiles").select("id, full_name, avatar_url").in("id", userIds),
      adminClient
        .from("organization_members")
        .select("user_id, organization_id, role, organizations(id, name, slug)")
        .in("user_id", userIds),
    ]);

    const rolesMap: Record<string, string> = {};
    (rolesRes.data ?? []).forEach((r: any) => { rolesMap[r.user_id] = r.role; });

    const profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
    (profilesRes.data ?? []).forEach((p: any) => {
      profilesMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
    });

    const orgsByUser: Record<string, Array<{ id: string; name: string; role: string }>> = {};
    (membersRes.data ?? []).forEach((m: any) => {
      if (!m.organizations) return;
      if (!orgsByUser[m.user_id]) orgsByUser[m.user_id] = [];
      orgsByUser[m.user_id].push({
        id: m.organizations.id,
        name: m.organizations.name,
        role: m.role,
      });
    });

    const enriched = list.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      banned_until: (u as any).banned_until ?? null,
      app_role: rolesMap[u.id] ?? "viewer",
      full_name: profilesMap[u.id]?.full_name ?? null,
      avatar_url: profilesMap[u.id]?.avatar_url ?? null,
      orgs: orgsByUser[u.id] ?? [],
    }));

    return new Response(JSON.stringify({ users: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("super-admin-users error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});