import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPopupCoupon } from "@/lib/popup/settings"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const { email, marketing_consent } = await req.json()

  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const normalized = email.toLowerCase().trim()
  const supabase = createAdminClient()

  // Only store the address when the visitor consented to marketing
  if (marketing_consent) {
    const { error } = await supabase
      .from("email_subscribers")
      .upsert(
        { email: normalized, status: "active", source: "popup" },
        { onConflict: "email", ignoreDuplicates: true }
      )
    if (error) {
      console.error("Popup subscribe failed:", error)
      return NextResponse.json({ error: "Subscription failed" }, { status: 500 })
    }
  }

  if (!marketing_consent) {
    return NextResponse.json({ success: true, coupon: null })
  }

  const coupon = (await getPopupCoupon(supabase)) || null
  return NextResponse.json({ success: true, coupon })
}
