CREATE TABLE IF NOT EXISTS country_settings (
  country_code TEXT PRIMARY KEY,
  hero_image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO country_settings (country_code) VALUES
  ('il'), ('us'), ('gb'), ('de'), ('fr'), ('it')
ON CONFLICT DO NOTHING;

ALTER TABLE country_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read country_settings"
  ON country_settings FOR SELECT TO public USING (true);

CREATE POLICY "service role all country_settings"
  ON country_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
