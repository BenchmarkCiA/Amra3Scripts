import { NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe/checkout"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { parseRequestedItems, priceItems, PricingError } from "@/lib/orders/pricing"
import { evaluateCoupon, type CouponRow } from "@/lib/coupons/calculate"
import { createPendingOrder } from "@/lib/orders/create"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const requested = parseRequestedItems(body.items)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const admin = createAdminClient()
    const lines = await priceItems(admin, requested)

    let discount = 0
    let couponCode: string | null = null
    if (typeof body.couponCode === "string" && body.couponCode.trim()) {
      const { data: coupon } = await admin
        .from("coupons")
        .select("*")
        .eq("code", body.couponCode.toUpperCase().trim())
        .maybeSingle()
      const result = evaluateCoupon(coupon as CouponRow | null, lines)
      if (!result.valid) {
        return NextResponse.json({ error: result.message }, { status: 400 })
      }
      discount = result.discount
      couponCode = result.code
    }

    const currency = "usd"
    const order = await createPendingOrder(admin, {
      lines,
      email: user?.email ?? "",
      customerId: user?.id ?? null,
      currency,
      discount,
      couponCode,
    })

    const session = await createCheckoutSession({
      orderId: order.id,
      lines,
      currency,
      customerEmail: user?.email,
      discountAmount: discount,
      couponCode: couponCode ?? undefined,
    })

    await admin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id)

    if (!session.url) throw new Error("Stripe returned no checkout URL")
    return NextResponse.json({ url: session.url })
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
