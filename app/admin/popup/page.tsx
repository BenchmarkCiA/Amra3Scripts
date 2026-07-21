export const dynamic = "force-dynamic"

import { createAdminClient } from "@/lib/supabase/admin"
import PopupAdminPanel from "@/components/admin/PopupAdminPanel"

const DEFAULT_SETTINGS = {
  enabled: false,
  template: "discount" as const,
  timing: "delay" as const,
  timing_value: 3,
  frequency: "session" as const,
  pages: "all" as const,
  heading: "Get 10% Off Your First Order",
  body: "Enter your email and receive an exclusive discount on your first purchase.",
  coupon_code: "",
  discount_percent: 10,
  cta_label: "Shop Now",
  cta_url: "",
}

export default async function AdminPopupPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "popup_settings")
    .single()

  const settings = { ...DEFAULT_SETTINGS, ...(data?.value ?? {}) }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Popup Widget</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure a popup to show visitors — collect emails, announce news, or offer discounts.
        </p>
      </div>
      <PopupAdminPanel initial={settings} />
    </div>
  )
}
