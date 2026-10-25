export interface CouponRow {
  code: string
  type: "percentage" | "fixed"
  value: number | string
  min_order_amount: number | string | null
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_until: string
  product_ids: string[] | null
  category_ids: string[] | null
  is_active: boolean
}

export interface CouponLine {
  product_id: string
  category_id: string | null
  unit_price: number
  quantity: number
}

export type CouponResult =
  | { valid: true; code: string; discount: number }
  | { valid: false; message: string }

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Single source of truth for coupon eligibility and discount.
 * Product and category restrictions are intersected (an item must satisfy both).
 */
export function evaluateCoupon(coupon: CouponRow | null, lines: CouponLine[], now = new Date()): CouponResult {
  if (!coupon) return { valid: false, message: "Coupon not found" }
  if (!coupon.is_active) return { valid: false, message: "Coupon is no longer active" }
  if (new Date(coupon.valid_from) > now) return { valid: false, message: "Coupon is not yet valid" }
  if (new Date(coupon.valid_until) < now) return { valid: false, message: "Coupon has expired" }
  if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
    return { valid: false, message: "Coupon has reached its usage limit" }
  }

  let applicable = lines
  if (coupon.product_ids?.length) {
    applicable = applicable.filter((l) => coupon.product_ids!.includes(l.product_id))
  }
  if (coupon.category_ids?.length) {
    applicable = applicable.filter((l) => l.category_id !== null && coupon.category_ids!.includes(l.category_id))
  }
  if (!applicable.length) return { valid: false, message: "Coupon is not valid for items in your cart" }

  const subtotal = applicable.reduce((sum, l) => sum + l.unit_price * l.quantity, 0)
  const min = coupon.min_order_amount === null ? 0 : Number(coupon.min_order_amount)
  if (min && subtotal < min) {
    return { valid: false, message: `Minimum order of ${min.toFixed(2)} required for this coupon` }
  }

  const value = Number(coupon.value)
  const discount =
    coupon.type === "percentage"
      ? round2((subtotal * Math.min(Math.max(value, 0), 100)) / 100)
      : round2(Math.min(Math.max(value, 0), subtotal))

  return { valid: true, code: coupon.code, discount }
}
