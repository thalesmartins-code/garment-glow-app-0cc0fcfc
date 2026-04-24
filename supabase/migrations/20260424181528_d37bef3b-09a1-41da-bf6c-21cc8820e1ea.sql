CREATE OR REPLACE FUNCTION public.trigger_ml_token_refresh()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, vault, net
AS $$
  SELECT net.http_post(
    url := 'https://gionpsuunfkkzzjdubfy.supabase.co/functions/v1/ml-token-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpb25wc3V1bmZra3p6amR1YmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTc2NDgsImV4cCI6MjA4ODEzMzY0OH0.mHbEEnXlynQopAd5j7A4B4emYwalXqvyVcvEh_G5gUk',
      'X-Cron-Secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
$$;

REVOKE ALL ON FUNCTION public.trigger_ml_token_refresh() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_ml_token_refresh() TO service_role;

SELECT public.trigger_ml_token_refresh();
