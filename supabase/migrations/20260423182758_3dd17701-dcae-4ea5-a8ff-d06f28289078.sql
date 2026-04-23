-- 1. Restrict ml_tokens column-level access to sensitive token columns.
-- We keep RLS row-level access broad (members can see their org's connected stores),
-- but revoke column SELECT on access_token and refresh_token from authenticated.
-- Edge functions use the service_role key and are unaffected.
REVOKE SELECT (access_token, refresh_token) ON public.ml_tokens FROM authenticated;
REVOKE SELECT (access_token, refresh_token) ON public.ml_tokens FROM anon;

-- Re-grant explicit SELECT on the safe columns to authenticated so existing app
-- queries (ml_user_id, expires_at, seller_id, organization_id) continue to work.
GRANT SELECT (
  id, user_id, ml_user_id, organization_id, seller_id,
  scope, token_type, expires_at, created_at, updated_at
) ON public.ml_tokens TO authenticated;

-- 2. Fix privilege escalation on organization_members.
-- Drop the existing INSERT policy and replace with an owner/admin-only version.
-- Initial organization creation should add the owner via a SECURITY DEFINER flow
-- (edge function or trigger), not via a self-insert RLS branch.
DROP POLICY IF EXISTS "Org owners and admins can add members" ON public.organization_members;

CREATE POLICY "Org owners and admins can add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  get_org_role(auth.uid(), organization_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])
);

-- Allow a user to insert themselves as 'owner' ONLY when the organization has no
-- members yet (initial bootstrap right after creating the org).
CREATE POLICY "Org creator can self-insert as owner on bootstrap"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'owner'::org_role
  AND EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = organization_members.organization_id
      AND o.owner_id = auth.uid()
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.organization_members existing
    WHERE existing.organization_id = organization_members.organization_id
  )
);

-- 3. Tighten organization_invites INSERT policy: enforce organization_id IS NOT NULL
-- (column is already NOT NULL but defense in depth via WITH CHECK).
DROP POLICY IF EXISTS "Owners and admins can create invites" ON public.organization_invites;

CREATE POLICY "Owners and admins can create invites"
ON public.organization_invites
FOR INSERT
TO authenticated
WITH CHECK (
  organization_id IS NOT NULL
  AND get_org_role(auth.uid(), organization_id) = ANY (ARRAY['owner'::org_role, 'admin'::org_role])
);