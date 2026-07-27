-- Add per-product personalization toggle (default off)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS allow_personalization BOOLEAN NOT NULL DEFAULT FALSE;
