-- Data Subject Access/Action Requests (DSAR)
CREATE TABLE IF NOT EXISTS public.dsar_requests (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  request_type TEXT        NOT NULL CHECK (request_type IN ('access','delete','correct','opt_out')),
  email        TEXT        NOT NULL,
  details      TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','in_progress','completed','rejected')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);

ALTER TABLE public.dsar_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.dsar_requests
  USING (false) WITH CHECK (false);
