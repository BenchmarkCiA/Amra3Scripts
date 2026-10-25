import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { parseRequestedItems, priceItems, PricingError } from "@/lib/orders/pricing"
import { evaluateCoupon, type CouponRow } from "@/lib/coupons/calculate"

export async function POST(request: NextRequest) {
  try {
    const { code, items } = await request.json()
    if (typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ valid: false, message: "Please enter a coupon code" })
    }

    const admin = createAdminClient()
    const lines = await priceItems(admin, parseRequestedItems(items))

    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .maybeSingle()

    const result = evaluateCoupon(coupon as CouponRow | null, lines)
    if (!result.valid) return NextResponse.json({ valid: false, message: result.message })

    return NextResponse.json({
      valid: true,
      code: result.code,
      type: (coupon as CouponRow).type,
      value: Number((coupon as CouponRow).value),
      discount_amount: result.discount,
    })
  } catch (err) {
    if (err instanceof PricingError) return NextResponse.json({ valid: false, message: err.message })
    console.error("Coupon validation error:", err)
    return NextResponse.json({ valid: false, message: "Validation failed" })
  }
}
