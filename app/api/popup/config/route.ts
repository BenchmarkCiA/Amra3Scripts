import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "popup_settings")
    .single()

  // Never expose the coupon publicly — it is only returned after consent via /api/popup/subscribe
  const { coupon_code: _hidden, ...publicValue } = (data?.value ?? { enabled: false }) as Record<string, unknown>
  void _hidden
  return NextResponse.json(
    publicValue,
    { headers: { "Cache-Control": "no-store" } }
  )
}
