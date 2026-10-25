import type { SupabaseClient } from "@supabase/supabase-js"
import type { PricedLine } from "./pricing"

export async function nextOrderNumber(supabase: SupabaseClient): Promise<string> {
  const { data, error } = await supabase.rpc("next_order_number")
  if (error || data === null || data === undefined) throw error ?? new Error("No order number")
  return `ORD-${data}`
}

/** Creates a pending order with its items before the customer is sent to Stripe. */
export async function createPendingOrder(
  supabase: SupabaseClient,
  opts: {
    lines: PricedLine[]
    email: string
    customerId: string | null
    currency: string
    discount: number
    couponCode: string | null
  }
) {
  const subtotal = Math.round(opts.lines.reduce((s, l) => s + l.unit_price * l.quantity, 0) * 100) / 100
  const total = Math.max(0, Math.round((subtotal - opts.discount) * 100) / 100)

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: await nextOrderNumber(supabase),
      customer_email: opts.email,
      customer_id: opts.customerId,
      status: "pending",
      subtotal,
      discount: opts.discount,
      total,
      currency: opts.currency.toUpperCase(),
      coupon_code: opts.couponCode,
      shipping_address: {},
    })
    .select("id, order_number")
    .single()
  if (error || !order) throw error ?? new Error("Order insert failed")

  const { error: itemsError } = await supabase.from("order_items").insert(
    opts.lines.map((l) => ({
      order_id: order.id,
      product_id: l.product_id,
      variant_id: l.variant_id,
      product_type: l.product_type,
      title: l.title,
      variant_title: l.variant_title,
      sku: l.sku,
      quantity: l.quantity,
      unit_price: l.unit_price,
      total_price: Math.round(l.unit_price * l.quantity * 100) / 100,
      image_url: l.image_url,
      custom_text: l.custom_text,
    }))
  )
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id)
    throw itemsError
  }

  return order as { id: string; order_number: string }
}
