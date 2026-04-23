
-- =========================================================================
-- 1. ESTENDER ENUM org_role PARA INCLUIR 'viewer'
-- =========================================================================
ALTER TYPE public.org_role ADD VALUE IF NOT EXISTS 'viewer';

-- =========================================================================
-- 2. FUNÇÃO has_org_role (security definer)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _role public.org_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- =========================================================================
-- 3. ADICIONAR organization_id EM TODAS AS TABELAS DE DOMÍNIO (nullable por enquanto)
-- =========================================================================
ALTER TABLE public.sellers                   ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.seller_stores             ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.sales_data                ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.shopee_orders             ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.shopee_sales              ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.audit_log                 ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_tokens                 ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_user_cache             ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_daily_cache            ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_hourly_cache           ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_product_daily_cache    ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_state_daily_cache      ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_ads_daily_cache        ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_ads_campaigns_cache    ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_ads_products_cache     ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.ml_sync_log               ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- =========================================================================
-- 4. POPULAR ORGANIZAÇÕES PARA USUÁRIOS EXISTENTES
--    Cria uma org "Workspace de {Nome}" para cada usuário em auth.users
--    que ainda não pertence a nenhuma organização.
-- =========================================================================
DO $$
DECLARE
  u record;
  new_org_id uuid;
  display_name text;
  base_slug text;
  final_slug text;
  suffix int;
BEGIN
  FOR u IN
    SELECT au.id, au.email, p.full_name
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.organization_members om WHERE om.user_id = au.id
    )
  LOOP
    display_name := COALESCE(NULLIF(trim(u.full_name), ''), split_part(u.email, '@', 1), 'Workspace');
    base_slug := lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    IF base_slug = '' THEN base_slug := 'workspace'; END IF;
    final_slug := base_slug;
    suffix := 1;
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = final_slug) LOOP
      suffix := suffix + 1;
      final_slug := base_slug || '-' || suffix::text;
    END LOOP;

    INSERT INTO public.organizations (name, slug, owner_id)
    VALUES ('Workspace de ' || display_name, final_slug, u.id)
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, u.id, 'owner');
  END LOOP;
END $$;

-- =========================================================================
-- 5. ATRIBUIR organization_id AOS REGISTROS EXISTENTES
--    Para tabelas com user_id direto, usa a primeira org do usuário.
--    Para seller_stores, herda do seller relacionado.
-- =========================================================================
-- Helper CTE pattern: pick the first org owned by each user
WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations
  ORDER BY owner_id, created_at ASC
)
UPDATE public.sellers s
SET organization_id = uo.org_id
FROM user_org uo
WHERE s.user_id = uo.user_id AND s.organization_id IS NULL;

UPDATE public.seller_stores ss
SET organization_id = s.organization_id
FROM public.sellers s
WHERE ss.seller_id = s.id AND ss.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.sales_data sd
SET organization_id = uo.org_id
FROM public.sellers s, user_org uo
WHERE sd.seller_id = s.id::text AND s.user_id = uo.user_id AND sd.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.shopee_orders t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.shopee_sales t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.audit_log t SET organization_id = uo.org_id
FROM user_org uo WHERE t.actor_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_tokens t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_user_cache t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_daily_cache t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_hourly_cache t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_product_daily_cache t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_state_daily_cache t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_ads_daily_cache t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_ads_campaigns_cache t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_ads_products_cache t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

WITH user_org AS (
  SELECT DISTINCT ON (owner_id) owner_id AS user_id, id AS org_id
  FROM public.organizations ORDER BY owner_id, created_at ASC
)
UPDATE public.ml_sync_log t SET organization_id = uo.org_id
FROM user_org uo WHERE t.user_id = uo.user_id AND t.organization_id IS NULL;

-- =========================================================================
-- 6. ÍNDICES em organization_id
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_sellers_org                ON public.sellers(organization_id);
CREATE INDEX IF NOT EXISTS idx_seller_stores_org          ON public.seller_stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_data_org             ON public.sales_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_shopee_orders_org          ON public.shopee_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_shopee_sales_org           ON public.shopee_sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org              ON public.audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_tokens_org              ON public.ml_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_user_cache_org          ON public.ml_user_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_daily_cache_org         ON public.ml_daily_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_hourly_cache_org        ON public.ml_hourly_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_product_daily_cache_org ON public.ml_product_daily_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_state_daily_cache_org   ON public.ml_state_daily_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_ads_daily_cache_org     ON public.ml_ads_daily_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_ads_campaigns_cache_org ON public.ml_ads_campaigns_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_ads_products_cache_org  ON public.ml_ads_products_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_ml_sync_log_org            ON public.ml_sync_log(organization_id);

-- =========================================================================
-- 7. NOVA TABELA organization_invites
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.organization_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  token_hash text NOT NULL UNIQUE,
  invited_by uuid NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_invites_org   ON public.organization_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.organization_invites(lower(email));

ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins can view org invites"
  ON public.organization_invites FOR SELECT TO authenticated
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

CREATE POLICY "Owners and admins can create invites"
  ON public.organization_invites FOR INSERT TO authenticated
  WITH CHECK (public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

CREATE POLICY "Owners and admins can revoke invites"
  ON public.organization_invites FOR UPDATE TO authenticated
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

CREATE POLICY "Owners and admins can delete invites"
  ON public.organization_invites FOR DELETE TO authenticated
  USING (public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- =========================================================================
-- 8. REFAZER RLS PARA ESCOPO POR ORGANIZAÇÃO
--    Estratégia: dropar policies antigas baseadas em user_id e criar novas
--    baseadas em is_org_member / get_org_role.
--    Mantemos compatibilidade: registros sem organization_id ficam acessíveis
--    pelo user_id legado durante a transição.
-- =========================================================================

-- Helper macro: cada bloco abaixo segue o mesmo padrão.

-- ---- sellers ----
DROP POLICY IF EXISTS "sellers: own rows" ON public.sellers;
CREATE POLICY "sellers org select" ON public.sellers FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "sellers org insert" ON public.sellers FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "sellers org update" ON public.sellers FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "sellers org delete" ON public.sellers FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- seller_stores ----
DROP POLICY IF EXISTS "seller_stores: own rows" ON public.seller_stores;
CREATE POLICY "seller_stores org select" ON public.seller_stores FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "seller_stores org insert" ON public.seller_stores FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "seller_stores org update" ON public.seller_stores FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "seller_stores org delete" ON public.seller_stores FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- sales_data ----
DROP POLICY IF EXISTS "Admins can delete any sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Admins can insert any sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Admins can update any sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Editors can delete own seller sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Editors can insert own seller sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Editors can update own seller sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Users can read own seller sales data" ON public.sales_data;
CREATE POLICY "sales_data org select" ON public.sales_data FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "sales_data org insert" ON public.sales_data FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "sales_data org update" ON public.sales_data FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "sales_data org delete" ON public.sales_data FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- shopee_orders ----
DROP POLICY IF EXISTS "Admins and editors can delete shopee_orders" ON public.shopee_orders;
DROP POLICY IF EXISTS "Admins and editors can insert shopee_orders" ON public.shopee_orders;
DROP POLICY IF EXISTS "Admins and editors can update shopee_orders" ON public.shopee_orders;
DROP POLICY IF EXISTS "Users can select own shopee_orders" ON public.shopee_orders;
CREATE POLICY "shopee_orders org select" ON public.shopee_orders FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "shopee_orders org insert" ON public.shopee_orders FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "shopee_orders org update" ON public.shopee_orders FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "shopee_orders org delete" ON public.shopee_orders FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- shopee_sales ----
DROP POLICY IF EXISTS "Admins and editors can delete shopee_sales" ON public.shopee_sales;
DROP POLICY IF EXISTS "Admins and editors can insert shopee_sales" ON public.shopee_sales;
DROP POLICY IF EXISTS "Admins and editors can update shopee_sales" ON public.shopee_sales;
DROP POLICY IF EXISTS "Users can select own shopee_sales" ON public.shopee_sales;
CREATE POLICY "shopee_sales org select" ON public.shopee_sales FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "shopee_sales org insert" ON public.shopee_sales FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "shopee_sales org update" ON public.shopee_sales FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "shopee_sales org delete" ON public.shopee_sales FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- audit_log ----
DROP POLICY IF EXISTS "Admins can view audit_log" ON public.audit_log;
CREATE POLICY "audit_log org select" ON public.audit_log FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_tokens ----
DROP POLICY IF EXISTS "Users can delete own ml_tokens" ON public.ml_tokens;
DROP POLICY IF EXISTS "Users can insert own ml_tokens" ON public.ml_tokens;
DROP POLICY IF EXISTS "Users can read own ml_tokens" ON public.ml_tokens;
DROP POLICY IF EXISTS "Users can update own ml_tokens" ON public.ml_tokens;
CREATE POLICY "ml_tokens org select" ON public.ml_tokens FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_tokens org insert" ON public.ml_tokens FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_tokens org update" ON public.ml_tokens FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_tokens org delete" ON public.ml_tokens FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_user_cache ----
DROP POLICY IF EXISTS "Users can delete own ml_user_cache" ON public.ml_user_cache;
DROP POLICY IF EXISTS "Users can insert own ml_user_cache" ON public.ml_user_cache;
DROP POLICY IF EXISTS "Users can select own ml_user_cache" ON public.ml_user_cache;
DROP POLICY IF EXISTS "Users can update own ml_user_cache" ON public.ml_user_cache;
CREATE POLICY "ml_user_cache org select" ON public.ml_user_cache FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_user_cache org insert" ON public.ml_user_cache FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_user_cache org update" ON public.ml_user_cache FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_user_cache org delete" ON public.ml_user_cache FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_daily_cache ----
DROP POLICY IF EXISTS "Users can delete own ml_daily_cache" ON public.ml_daily_cache;
DROP POLICY IF EXISTS "Users can insert own ml_daily_cache" ON public.ml_daily_cache;
DROP POLICY IF EXISTS "Users can select own ml_daily_cache" ON public.ml_daily_cache;
DROP POLICY IF EXISTS "Users can update own ml_daily_cache" ON public.ml_daily_cache;
CREATE POLICY "ml_daily_cache org select" ON public.ml_daily_cache FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_daily_cache org insert" ON public.ml_daily_cache FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_daily_cache org update" ON public.ml_daily_cache FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_daily_cache org delete" ON public.ml_daily_cache FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_hourly_cache ----
DROP POLICY IF EXISTS "Users can delete own ml_hourly_cache" ON public.ml_hourly_cache;
DROP POLICY IF EXISTS "Users can insert own ml_hourly_cache" ON public.ml_hourly_cache;
DROP POLICY IF EXISTS "Users can select own ml_hourly_cache" ON public.ml_hourly_cache;
DROP POLICY IF EXISTS "Users can update own ml_hourly_cache" ON public.ml_hourly_cache;
CREATE POLICY "ml_hourly_cache org select" ON public.ml_hourly_cache FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_hourly_cache org insert" ON public.ml_hourly_cache FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_hourly_cache org update" ON public.ml_hourly_cache FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_hourly_cache org delete" ON public.ml_hourly_cache FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_product_daily_cache ----
DROP POLICY IF EXISTS "Users can delete own ml_product_daily_cache" ON public.ml_product_daily_cache;
DROP POLICY IF EXISTS "Users can insert own ml_product_daily_cache" ON public.ml_product_daily_cache;
DROP POLICY IF EXISTS "Users can select own ml_product_daily_cache" ON public.ml_product_daily_cache;
DROP POLICY IF EXISTS "Users can update own ml_product_daily_cache" ON public.ml_product_daily_cache;
CREATE POLICY "ml_product_daily_cache org select" ON public.ml_product_daily_cache FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_product_daily_cache org insert" ON public.ml_product_daily_cache FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_product_daily_cache org update" ON public.ml_product_daily_cache FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_product_daily_cache org delete" ON public.ml_product_daily_cache FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_state_daily_cache ----
DROP POLICY IF EXISTS "Users can delete own ml_state_daily_cache" ON public.ml_state_daily_cache;
DROP POLICY IF EXISTS "Users can insert own ml_state_daily_cache" ON public.ml_state_daily_cache;
DROP POLICY IF EXISTS "Users can select own ml_state_daily_cache" ON public.ml_state_daily_cache;
DROP POLICY IF EXISTS "Users can update own ml_state_daily_cache" ON public.ml_state_daily_cache;
CREATE POLICY "ml_state_daily_cache org select" ON public.ml_state_daily_cache FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_state_daily_cache org insert" ON public.ml_state_daily_cache FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_state_daily_cache org update" ON public.ml_state_daily_cache FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_state_daily_cache org delete" ON public.ml_state_daily_cache FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_ads_daily_cache ----
DROP POLICY IF EXISTS "Users can delete own ml_ads_daily_cache" ON public.ml_ads_daily_cache;
DROP POLICY IF EXISTS "Users can insert own ml_ads_daily_cache" ON public.ml_ads_daily_cache;
DROP POLICY IF EXISTS "Users can select own ml_ads_daily_cache" ON public.ml_ads_daily_cache;
DROP POLICY IF EXISTS "Users can update own ml_ads_daily_cache" ON public.ml_ads_daily_cache;
CREATE POLICY "ml_ads_daily_cache org select" ON public.ml_ads_daily_cache FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_ads_daily_cache org insert" ON public.ml_ads_daily_cache FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_ads_daily_cache org update" ON public.ml_ads_daily_cache FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_ads_daily_cache org delete" ON public.ml_ads_daily_cache FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_ads_campaigns_cache ----
DROP POLICY IF EXISTS "Users can delete own ml_ads_campaigns_cache" ON public.ml_ads_campaigns_cache;
DROP POLICY IF EXISTS "Users can insert own ml_ads_campaigns_cache" ON public.ml_ads_campaigns_cache;
DROP POLICY IF EXISTS "Users can select own ml_ads_campaigns_cache" ON public.ml_ads_campaigns_cache;
DROP POLICY IF EXISTS "Users can update own ml_ads_campaigns_cache" ON public.ml_ads_campaigns_cache;
CREATE POLICY "ml_ads_campaigns_cache org select" ON public.ml_ads_campaigns_cache FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_ads_campaigns_cache org insert" ON public.ml_ads_campaigns_cache FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_ads_campaigns_cache org update" ON public.ml_ads_campaigns_cache FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_ads_campaigns_cache org delete" ON public.ml_ads_campaigns_cache FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_ads_products_cache ----
DROP POLICY IF EXISTS "Users can delete own ml_ads_products_cache" ON public.ml_ads_products_cache;
DROP POLICY IF EXISTS "Users can insert own ml_ads_products_cache" ON public.ml_ads_products_cache;
DROP POLICY IF EXISTS "Users can select own ml_ads_products_cache" ON public.ml_ads_products_cache;
DROP POLICY IF EXISTS "Users can update own ml_ads_products_cache" ON public.ml_ads_products_cache;
CREATE POLICY "ml_ads_products_cache org select" ON public.ml_ads_products_cache FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_ads_products_cache org insert" ON public.ml_ads_products_cache FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_ads_products_cache org update" ON public.ml_ads_products_cache FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_ads_products_cache org delete" ON public.ml_ads_products_cache FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- ---- ml_sync_log ----
DROP POLICY IF EXISTS "Users can delete own ml_sync_log" ON public.ml_sync_log;
DROP POLICY IF EXISTS "Users can insert own ml_sync_log" ON public.ml_sync_log;
DROP POLICY IF EXISTS "Users can select own ml_sync_log" ON public.ml_sync_log;
DROP POLICY IF EXISTS "Users can update own ml_sync_log" ON public.ml_sync_log;
CREATE POLICY "ml_sync_log org select" ON public.ml_sync_log FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id));
CREATE POLICY "ml_sync_log org insert" ON public.ml_sync_log FOR INSERT TO authenticated
  WITH CHECK (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_sync_log org update" ON public.ml_sync_log FOR UPDATE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin','member'));
CREATE POLICY "ml_sync_log org delete" ON public.ml_sync_log FOR DELETE TO authenticated
  USING (organization_id IS NOT NULL AND public.get_org_role(auth.uid(), organization_id) IN ('owner','admin'));
