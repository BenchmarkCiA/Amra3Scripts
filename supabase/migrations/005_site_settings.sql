CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB DEFAULT '{}'
);

INSERT INTO site_settings (key, value) VALUES
  ('social_links', '{"instagram": "", "tiktok": "", "facebook": ""}')
ON CONFLICT DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read site_settings" ON site_settings;
DROP POLICY IF EXISTS "service role all site_settings" ON site_settings;

CREATE POLICY "public read site_settings"
  ON site_settings FOR SELECT TO public USING (true);

CREATE POLICY "service role all site_settings"
  ON site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
