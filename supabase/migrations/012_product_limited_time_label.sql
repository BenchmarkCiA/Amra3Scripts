ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS limited_time_label TEXT DEFAULT NULL;
