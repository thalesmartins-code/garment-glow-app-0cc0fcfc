import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccess } from "@/config/roleAccess";
import { PageLoader } from "@/components/ui/PageLoader";

export function RoleRoute({ children }: { children: React.ReactNode }) {
  const { role, loading } = useAuth();
  const location = useLocation();

  if (loading || role === null) {
    return <PageLoader />;
  }

  if (!canAccess(role, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
