-- Popup widget configuration
INSERT INTO public.site_settings (key, value)
VALUES (
  'popup_settings',
  '{
    "enabled": false,
    "template": "discount",
    "timing": "delay",
    "timing_value": 3,
    "frequency": "session",
    "pages": "all",
    "heading": "Get 10% Off Your First Order",
    "body": "Join our community and receive an exclusive discount on your first purchase.",
    "coupon_code": "",
    "discount_percent": 10,
    "cta_label": "Shop Now",
    "cta_url": ""
  }'
)
ON CONFLICT (key) DO NOTHING;
