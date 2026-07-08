import { NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe/checkout"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

interface CartItem {
  product_id: string
  variant_id: string
  quantity: number
  price: number
  [key: string]: unknown
}

export async function POST(request: NextRequest) {
  try {
    const { items, couponCode } = await request.json()

    if (!items || !items.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let discountAmount = 0
    let validatedCouponCode: string | undefined

    if (couponCode) {
      const admin = createAdminClient()
      const { data: coupon } = await admin
        .from("coupons")
        .select("*")
        .eq("code", (couponCode as string).toUpperCase().trim())
        .single()

      if (
        coupon &&
        coupon.is_active &&
        new Date(coupon.valid_from) <= new Date() &&
        new Date(coupon.valid_until) >= new Date() &&
        (coupon.max_uses === null || coupon.uses_count < coupon.max_uses)
      ) {
        let applicableItems: CartItem[] = items
        if (coupon.product_ids?.length) {
          applicableItems = items.filter((i: CartItem) => coupon.product_ids.includes(i.product_id))
        }
        if (coupon.category_ids?.length && applicableItems.length) {
          const productIds = [...new Set(applicableItems.map((i: CartItem) => i.product_id))]
          const { data: products } = await admin
            .from("products")
            .select("id, category_id")
            .in("id", productIds)
          const catMap: Record<string, string> = Object.fromEntries(
            (products ?? []).map((p: { id: string; category_id: string }) => [p.id, p.category_id])
          )
          applicableItems = applicableItems.filter((i: CartItem) =>
            coupon.category_ids.includes(catMap[i.product_id])
          )
        }

        if (applicableItems.length) {
          const subtotal = applicableItems.reduce(
            (sum: number, i: CartItem) => sum + i.price * i.quantity,
            0
          )
          if (!coupon.min_order_amount || subtotal >= Number(coupon.min_order_amount)) {
            if (coupon.type === "percentage") {
              discountAmount = Math.round((subtotal * Number(coupon.value)) / 100 * 100) / 100
            } else {
              discountAmount = Math.min(Number(coupon.value), subtotal)
            }
            validatedCouponCode = coupon.code

            await admin
              .from("coupons")
              .update({ uses_count: coupon.uses_count + 1 })
              .eq("id", coupon.id)
          }
        }
      }
    }

    const session = await createCheckoutSession(items, user?.email, discountAmount, validatedCouponCode)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
