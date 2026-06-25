import { stripe } from "./client"
import type { CartItem } from "@/types"

export async function createCheckoutSession(
  items: CartItem[],
  customerEmail?: string
) {
  const line_items = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.variant?.title
          ? `${item.product?.title} — ${item.variant.title}`
          : item.product?.title ?? "Product",
        images: item.product?.images?.[0]?.url
          ? [item.product.images[0].url]
          : [],
        metadata: {
          product_id: item.product_id,
          variant_id: item.variant_id,
        },
      },
      unit_amount: Math.round((item.variant?.price ?? 0) * 100),
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    customer_email: customerEmail,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    shipping_address_collection: {
      allowed_countries: ["US", "GB", "IL", "CA", "AU", "DE", "FR", "NL"],
    },
    metadata: {
      items: JSON.stringify(
        items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
        }))
      ),
    },
  })

  return session
}
