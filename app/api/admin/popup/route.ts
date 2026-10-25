import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/requireAdmin"
import { getPopupCoupon, sanitizePopupSettings } from "@/lib/popup/settings"

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "popup_settings")
    .single()

  return NextResponse.json({
    ...(data?.value ?? { enabled: false }),
    coupon_code: await getPopupCoupon(supabase),
  })
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json()) as Record<string, unknown>
  let clean: Record<string, unknown>
  try {
    clean = sanitizePopupSettings(body)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "popup_settings")
    .single()

  const { coupon_code: _legacy, ...existingValue } = (existing?.value ?? {}) as Record<string, unknown>
  void _legacy
  const merged = { ...existingValue, ...clean }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "popup_settings", value: merged }, { onConflict: "key" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (typeof body.coupon_code === "string") {
    const code = body.coupon_code.toUpperCase().trim().slice(0, 64)
    const { error: couponError } = await supabase
      .from("site_settings")
      .upsert({ key: "popup_coupon", value: { code } }, { onConflict: "key" })
    if (couponError) return NextResponse.json({ error: couponError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, settings: { ...merged, coupon_code: body.coupon_code ?? "" } })
}
