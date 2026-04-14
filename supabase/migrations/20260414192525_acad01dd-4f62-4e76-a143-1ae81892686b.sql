
-- ============================================================
-- 1. SALES_DATA: editors só podem escrever dados dos próprios sellers
-- ============================================================

-- Drop existing permissive write policies
DROP POLICY IF EXISTS "Admins and editors can insert sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Admins and editors can update sales data" ON public.sales_data;
DROP POLICY IF EXISTS "Admins and editors can delete sales data" ON public.sales_data;

-- INSERT: admins can insert anything; editors only their own sellers
CREATE POLICY "Admins can insert any sales data"
ON public.sales_data FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can insert own seller sales data"
ON public.sales_data FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'editor')
  AND seller_id IN (SELECT id::text FROM public.sellers WHERE user_id = auth.uid())
);

-- UPDATE: same scoping
CREATE POLICY "Admins can update any sales data"
ON public.sales_data FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can update own seller sales data"
ON public.sales_data FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'editor')
  AND seller_id IN (SELECT id::text FROM public.sellers WHERE user_id = auth.uid())
);

-- DELETE: same scoping
CREATE POLICY "Admins can delete any sales data"
ON public.sales_data FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can delete own seller sales data"
ON public.sales_data FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'editor')
  AND seller_id IN (SELECT id::text FROM public.sellers WHERE user_id = auth.uid())
);
