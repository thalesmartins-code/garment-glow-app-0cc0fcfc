import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/ui/PageLoader";

/**
 * Guarda baseada em app_role = 'admin' (super admin global do sistema).
 * Diferente de RoleRoute, que checa org_role dentro de uma organização.
 */
export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setChecking(false);
      setIsSuperAdmin(false);
      return;
    }
    setChecking(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setIsSuperAdmin(data?.role === "admin");
        setChecking(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  if (authLoading || checking) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}