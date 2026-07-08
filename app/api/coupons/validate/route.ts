import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

interface CartItem {
  product_id: string
  variant_id: string
  quantity: number
  price: number
}

export async function POST(request: NextRequest) {
  try {
    const { code, items } = await request.json() as { code: string; items: CartItem[] }

    if (!code || !items?.length) {
      return NextResponse.json({ valid: false, message: "Invalid request" })
    }

    const admin = createAdminClient()
    const { data: coupon } = await admin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .single()

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Coupon not found" })
    }
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, message: "Coupon is no longer active" })
    }

    const now = new Date()
    if (new Date(coupon.valid_from) > now) {
      return NextResponse.json({ valid: false, message: "Coupon is not yet valid" })
    }
    if (new Date(coupon.valid_until) < now) {
      return NextResponse.json({ valid: false, message: "Coupon has expired" })
    }
    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: "Coupon has reached its usage limit" })
    }

    // Determine which items the coupon applies to
    let applicableItems = items

    if (coupon.product_ids && coupon.product_ids.length > 0) {
      applicableItems = items.filter((i) => coupon.product_ids.includes(i.product_id))
      if (!applicableItems.length) {
        return NextResponse.json({ valid: false, message: "Coupon is not valid for items in your cart" })
      }
    }

    if (coupon.category_ids && coupon.category_ids.length > 0) {
      const productIds = [...new Set(items.map((i) => i.product_id))]
      const { data: products } = await admin
        .from("products")
        .select("id, category_id")
        .in("id", productIds)

      const catMap: Record<string, string> = Object.fromEntries(
        (products ?? []).map((p) => [p.id, p.category_id])
      )
      applicableItems = items.filter((i) => coupon.category_ids.includes(catMap[i.product_id]))
      if (!applicableItems.length) {
        return NextResponse.json({ valid: false, message: "Coupon is not valid for items in your cart" })
      }
    }

    const subtotal = applicableItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    if (coupon.min_order_amount && subtotal < Number(coupon.min_order_amount)) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of $${Number(coupon.min_order_amount).toFixed(2)} required`,
      })
    }

    let discountAmount: number
    if (coupon.type === "percentage") {
      discountAmount = (subtotal * Number(coupon.value)) / 100
    } else {
      discountAmount = Math.min(Number(coupon.value), subtotal)
    }
    discountAmount = Math.round(discountAmount * 100) / 100

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discount_amount: discountAmount,
    })
  } catch (err) {
    console.error("Coupon validation error:", err)
    return NextResponse.json({ valid: false, message: "Validation failed" })
  }
}
