-- Create CRON_SECRET in vault if missing and reschedule ml-token-refresh
-- to send it via X-Cron-Secret header.

-- 1. Ensure pgcrypto for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Insert/update CRON_SECRET in the vault (idempotent).
DO $$
DECLARE
  v_secret_id uuid;
  v_new_value text;
BEGIN
  SELECT id INTO v_secret_id FROM vault.secrets WHERE name = 'CRON_SECRET';
  IF v_secret_id IS NULL THEN
    v_new_value := encode(gen_random_bytes(32), 'hex');
    PERFORM vault.create_secret(v_new_value, 'CRON_SECRET', 'Shared secret for pg_cron -> edge function calls');
  END IF;
END $$;

-- 3. Recreate cron job to include the X-Cron-Secret header.
SELECT cron.unschedule('ml-token-refresh-every-20min');

SELECT cron.schedule(
  'ml-token-refresh-every-20min',
  '*/20 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://gionpsuunfkkzzjdubfy.supabase.co/functions/v1/ml-token-refresh',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpb25wc3V1bmZra3p6amR1YmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTc2NDgsImV4cCI6MjA4ODEzMzY0OH0.mHbEEnXlynQopAd5j7A4B4emYwalXqvyVcvEh_G5gUk',
      'X-Cron-Secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
