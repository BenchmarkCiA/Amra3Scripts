import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { email, marketing_consent } = await req.json()

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Upsert customer record
  await supabase.from("customers").upsert(
    { email: email.toLowerCase().trim(), marketing_consent: !!marketing_consent },
    { onConflict: "email", ignoreDuplicates: false }
  )

  // Only return coupon if they consented
  if (!marketing_consent) {
    return NextResponse.json({ success: true, coupon: null })
  }

  const { data: settings } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "popup_settings")
    .single()

  const coupon = settings?.value?.coupon_code ?? null

  return NextResponse.json({ success: true, coupon })
}
