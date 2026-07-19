-- Contact messages sent through the chat widget
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send contact message" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Insert default chat settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('chat_settings', '{"enabled": false, "position": "bottom-right", "greeting": "Hi there! How can we help you?"}'),
  ('chat_faqs', '[]')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(is_read) WHERE is_read = false;
