import { stripe } from "./client"
import type { PricedLine } from "@/lib/orders/pricing"

interface SessionInput {
  orderId: string
  lines: PricedLine[]
  currency: string
  customerEmail?: string
  discountAmount?: number
  couponCode?: string
}

export async function createCheckoutSession({
  orderId,
  lines,
  currency,
  customerEmail,
  discountAmount,
  couponCode,
}: SessionInput) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not set")

  const line_items = lines.map((line) => ({
    price_data: {
      currency,
      product_data: {
        name: line.variant_title ? `${line.title} — ${line.variant_title}` : line.title,
        ...(line.custom_text ? { description: `Personal text: ${line.custom_text}` } : {}),
        images: line.image_url ? [line.image_url] : [],
        metadata: { product_id: line.product_id, variant_id: line.variant_id },
      },
      unit_amount: Math.round(line.unit_price * 100),
    },
    quantity: line.quantity,
  }))

  let discounts: Array<{ coupon: string }> | undefined
  if (discountAmount && discountAmount > 0) {
    const stripeCoupon = await stripe.coupons.create({
      amount_off: Math.round(discountAmount * 100),
      currency,
      duration: "once",
      max_redemptions: 1,
      name: couponCode ?? "Discount",
    })
    discounts = [{ coupon: stripeCoupon.id }]
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    discounts,
    customer_email: customerEmail,
    client_reference_id: orderId,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout`,
    shipping_address_collection: {
      allowed_countries: ["US", "GB", "IL", "CA", "AU", "DE", "FR", "IT", "NL"],
    },
    // Only the order id — the order rows hold the items (Stripe caps metadata values at 500 chars)
    metadata: { order_id: orderId },
    payment_intent_data: { metadata: { order_id: orderId } },
  })
}
