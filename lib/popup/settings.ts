import type { SupabaseClient } from "@supabase/supabase-js"
import { safeHref } from "@/lib/utils/safeUrl"

export const POPUP_KEYS = [
  "enabled", "template", "timing", "timing_value", "frequency", "pages",
  "heading", "body", "discount_percent", "cta_label", "cta_url",
] as const

const ENUMS: Record<string, readonly string[]> = {
  template: ["discount", "announcement", "newsletter"],
  timing: ["delay", "exit", "scroll"],
  frequency: ["session", "day", "always"],
  pages: ["all", "storefront"],
}

/** Whitelist + validate admin-supplied popup settings. Throws on invalid input. */
export function sanitizePopupSettings(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const key of POPUP_KEYS) {
    if (!(key in body)) continue
    const v = body[key]
    if (key === "enabled") out[key] = !!v
    else if (key === "timing_value" || key === "discount_percent") {
      const n = Number(v)
      if (!Number.isFinite(n) || n < 0 || n > 100000) throw new Error(`Invalid ${key}`)
      out[key] = n
    } else if (key in ENUMS) {
      if (!ENUMS[key].includes(String(v))) throw new Error(`Invalid ${key}`)
      out[key] = v
    } else if (key === "cta_url") {
      const s = String(v ?? "").trim()
      if (s && !safeHref(s)) throw new Error("Button link must start with / or https://")
      out[key] = s
    } else {
      out[key] = String(v ?? "").slice(0, 2000)
    }
  }
  return out
}

export async function getPopupCoupon(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase.from("site_settings").select("value").eq("key", "popup_coupon").maybeSingle()
  return (data?.value as { code?: string } | null)?.code ?? ""
}
