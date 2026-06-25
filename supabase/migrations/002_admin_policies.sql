-- Service role bypass (used by admin API routes with SUPABASE_SERVICE_ROLE_KEY)
-- These policies allow full access when using the service role

CREATE POLICY "Service role full access to products" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to product_variants" ON product_variants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to order_items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to customers" ON customers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to cart_sessions" ON cart_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to email_subscribers" ON email_subscribers
  FOR ALL USING (auth.role() = 'service_role');
