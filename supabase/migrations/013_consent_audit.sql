-- Consent audit log. No raw IP addresses are stored.
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    TEXT,                       -- client-generated random ID
  region        TEXT        NOT NULL,       -- 'strict' | 'notice'
  categories    JSONB       NOT NULL,       -- { necessary, analytics, marketing }
  gpc           BOOLEAN     NOT NULL DEFAULT false,
  policy_version TEXT       NOT NULL,
  user_agent    TEXT,                       -- truncated to 512 chars
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
-- Only the service role (admin client) may read/write
CREATE POLICY "Service role only" ON public.consent_logs
  USING (false) WITH CHECK (false);
