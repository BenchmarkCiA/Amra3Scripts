-- 015: security & data-integrity hardening

-- ── Schema drift: column used by the app but never migrated ─────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS country_codes JSONB DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_products_country_codes ON public.products USING GIN (country_codes);

-- ── Orders: idempotent Stripe linkage + personalization text ────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_stripe_session_id ON public.orders (stripe_session_id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS custom_text TEXT;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items (variant_id);

-- Deleting a product / variant / category must not fail because of history
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_variant_id_fkey
  FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE public.products
  ADD CONSTRAINT products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Printify variant upsert needs a real conflict target
CREATE UNIQUE INDEX IF NOT EXISTS uq_variants_product_printify
  ON public.product_variants (product_id, printify_variant_id);

-- ── Order numbers from the existing sequence ────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 10001;

CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT nextval('public.order_number_seq') $$;

REVOKE ALL ON FUNCTION public.next_order_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_order_number() TO service_role;

-- ── Atomic coupon redemption (respects max_uses under concurrency) ──────────
CREATE OR REPLACE FUNCTION public.increment_coupon_use(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated INTEGER;
BEGIN
  UPDATE public.coupons
     SET uses_count = uses_count + 1
   WHERE code = p_code
     AND (max_uses IS NULL OR uses_count < max_uses);
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_coupon_use(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_use(TEXT) TO service_role;

-- ── Atomic stock decrement (inventory -1 = untracked) ───────────────────────
CREATE OR REPLACE FUNCTION public.decrement_inventory(p_variant_id UUID, p_qty INTEGER)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.product_variants
     SET inventory = GREATEST(inventory - p_qty, 0)
   WHERE id = p_variant_id AND inventory >= 0
$$;

REVOKE ALL ON FUNCTION public.decrement_inventory(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_inventory(UUID, INTEGER) TO service_role;

-- ── RLS fixes ───────────────────────────────────────────────────────────────
-- Anonymous users could read every subscriber's email
DROP POLICY IF EXISTS "Users can view own subscription" ON public.email_subscribers;
CREATE POLICY "Users can view own subscription" ON public.email_subscribers
  FOR SELECT USING (customer_id IS NOT NULL AND customer_id = auth.uid());

-- Direct anon inserts bypassed the API; all writes now go through the server
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
DROP POLICY IF EXISTS "Anyone can send contact message" ON public.contact_messages;

-- Anonymous users could read/modify every guest cart
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart_sessions;
CREATE POLICY "Users can manage own cart" ON public.cart_sessions
  FOR ALL USING (customer_id IS NOT NULL AND customer_id = auth.uid())
  WITH CHECK (customer_id IS NOT NULL AND customer_id = auth.uid());

-- ── Popup coupon: keep it out of publicly readable settings ─────────────────
INSERT INTO public.site_settings (key, value)
SELECT 'popup_coupon', jsonb_build_object('code', COALESCE(value->>'coupon_code', ''))
  FROM public.site_settings WHERE key = 'popup_settings'
ON CONFLICT (key) DO NOTHING;

UPDATE public.site_settings
   SET value = value - 'coupon_code'
 WHERE key = 'popup_settings';

DROP POLICY IF EXISTS "public read site_settings" ON public.site_settings;
CREATE POLICY "public read site_settings"
  ON public.site_settings FOR SELECT TO public USING (key <> 'popup_coupon');
