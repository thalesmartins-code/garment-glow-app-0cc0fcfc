-- Fix 1: Restrict sales_data SELECT to user's own sellers (or admin)
DROP POLICY IF EXISTS "Authenticated users can read sales data" ON public.sales_data;

CREATE POLICY "Users can read own seller sales data"
  ON public.sales_data FOR SELECT
  TO authenticated
  USING (
    seller_id IN (
      SELECT id::text FROM public.sellers WHERE user_id = auth.uid()
    )
    OR get_user_role(auth.uid()) = 'admin'
  );

-- Fix 2: Add SELECT policy on avatars storage bucket
CREATE POLICY "Users can view own avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);