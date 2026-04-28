import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  role: OrgRole;
}

interface OrganizationContextType {
  orgs: Organization[];
  currentOrg: Organization | null;
  orgRole: OrgRole | null;
  loading: boolean;
  viewerPermissions: Set<string>;
  switchOrg: (id: string) => void;
  refreshOrgs: () => Promise<void>;
  refreshViewerPermissions: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);
const STORAGE_KEY = "currentOrgId";

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerPermissions, setViewerPermissions] = useState<Set<string>>(new Set());
  // Tracks which user id the current `orgs` state corresponds to.
  // If this doesn't match the auth user, we are in a transient loading state.
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  const loadOrgs = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const { data: members, error } = await supabase
        .from("organization_members")
        .select("role, organization_id, organizations(id, name, slug, owner_id)")
        .eq("user_id", uid);

      if (error) {
        setOrgs([]);
        setCurrentOrg(null);
        return;
      }

      const list: Organization[] = (members ?? [])
        .filter((m: any) => m.organizations)
        .map((m: any) => ({
          id: m.organizations.id,
          name: m.organizations.name,
          slug: m.organizations.slug,
          owner_id: m.organizations.owner_id,
          role: m.role as OrgRole,
        }));

      setOrgs(list);

      if (list.length === 0) {
        setCurrentOrg(null);
        setViewerPermissions(new Set());
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      const found = list.find((o) => o.id === stored) ?? list[0] ?? null;
      setCurrentOrg(found);
      if (found) localStorage.setItem(STORAGE_KEY, found.id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      setOrgs([]);
      setCurrentOrg(null);
      setViewerPermissions(new Set());
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoadedUserId(uid);
      setLoading(false);
    }
  }, []);

  const loadViewerPermissions = useCallback(async (uid: string, orgId: string) => {
    const { data } = await supabase
      .from("member_route_permissions")
      .select("route")
      .eq("organization_id", orgId)
      .eq("user_id", uid);
    setViewerPermissions(new Set((data ?? []).map((r: any) => r.route)));
  }, []);

  // Depend on `user?.id` (primitive) instead of the user object so that
  // silent token refreshes (which produce a new `user` reference for the
  // same id) don't trigger a full reload of organizations.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (userId) {
      setLoading(true);
      loadOrgs(userId);
    } else {
      setOrgs([]);
      setCurrentOrg(null);
      setViewerPermissions(new Set());
      setLoadedUserId(null);
      setLoading(false);
    }
  }, [userId, loadOrgs]);

  // Load viewer permissions whenever current org changes (only relevant for viewer role)
  const currentOrgId = currentOrg?.id ?? null;
  const currentOrgRole = currentOrg?.role ?? null;
  useEffect(() => {
    if (userId && currentOrgId) {
      if (currentOrgRole === "viewer") {
        loadViewerPermissions(userId, currentOrgId);
      } else {
        setViewerPermissions(new Set());
      }
    }
  }, [userId, currentOrgId, currentOrgRole, loadViewerPermissions]);

  const switchOrg = useCallback((id: string) => {
    const found = orgs.find((o) => o.id === id);
    if (found) {
      setCurrentOrg(found);
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, [orgs]);

  const refreshOrgs = useCallback(async () => {
    if (user) await loadOrgs(user.id);
  }, [user, loadOrgs]);

  const refreshViewerPermissions = useCallback(async () => {
    if (user && currentOrg && currentOrg.role === "viewer") {
      await loadViewerPermissions(user.id, currentOrg.id);
    }
  }, [user, currentOrg, loadViewerPermissions]);

  // Effective loading: if auth user changed but orgs not yet reloaded for that
  // user id, we MUST report loading=true. This prevents ProtectedRoute from
  // observing a transient { user: set, currentOrg: null, loading: false } window
  // and erroneously signing the user out.
  const effectiveLoading = loading || (!!userId && loadedUserId !== userId);

  return (
    <OrganizationContext.Provider
      value={{
        orgs,
        currentOrg,
        orgRole: currentOrg?.role ?? null,
        loading: effectiveLoading,
        viewerPermissions,
        switchOrg,
        refreshOrgs,
        refreshViewerPermissions,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error("useOrganization must be used within OrganizationProvider");
  return ctx;
}