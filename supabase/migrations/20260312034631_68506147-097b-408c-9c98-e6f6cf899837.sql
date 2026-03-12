
-- Cache de métricas diárias do Mercado Livre
CREATE TABLE public.ml_daily_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  total_revenue numeric NOT NULL DEFAULT 0,
  approved_revenue numeric NOT NULL DEFAULT 0,
  qty_orders integer NOT NULL DEFAULT 0,
  cancelled_orders integer NOT NULL DEFAULT 0,
  shipped_orders integer NOT NULL DEFAULT 0,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.ml_daily_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own ml_daily_cache" ON public.ml_daily_cache FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own ml_daily_cache" ON public.ml_daily_cache FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own ml_daily_cache" ON public.ml_daily_cache FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own ml_daily_cache" ON public.ml_daily_cache FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Cache de dados do usuário ML
CREATE TABLE public.ml_user_cache (
  user_id uuid PRIMARY KEY,
  ml_user_id bigint,
  nickname text,
  country text,
  permalink text,
  active_listings integer NOT NULL DEFAULT 0,
  synced_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ml_user_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own ml_user_cache" ON public.ml_user_cache FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own ml_user_cache" ON public.ml_user_cache FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own ml_user_cache" ON public.ml_user_cache FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own ml_user_cache" ON public.ml_user_cache FOR DELETE TO authenticated USING (user_id = auth.uid());
