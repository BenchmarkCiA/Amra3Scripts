import { stripe } from "./client"

interface FlatCartItem {
  product_id: string
  variant_id: string
  quantity: number
  title?: string
  variant_title?: string
  price?: number
  image_url?: string
  customText?: string
  product?: { title?: string; images?: Array<{ url: string }> }
  variant?: { title?: string; price?: number }
}

export async function createCheckoutSession(
  items: FlatCartItem[],
  customerEmail?: string,
  discountAmount?: number,
  couponCode?: string
) {
  const line_items = items.map((item) => {
    const productTitle = item.title ?? item.product?.title ?? "Product"
    const variantTitle = item.variant_title ?? item.variant?.title
    const name = variantTitle ? `${productTitle} — ${variantTitle}` : productTitle
    const imageUrl = item.image_url ?? item.product?.images?.[0]?.url
    const unitAmount = Math.round((item.price ?? item.variant?.price ?? 0) * 100)

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name,
          images: imageUrl ? [imageUrl] : [],
          metadata: {
            product_id: item.product_id,
            variant_id: item.variant_id,
          },
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    }
  })

  let discounts: Array<{ coupon: string }> | undefined
  if (discountAmount && discountAmount > 0) {
    const stripeCoupon = await stripe.coupons.create({
      amount_off: Math.round(discountAmount * 100),
      currency: "usd",
      duration: "once",
      name: couponCode ?? "Discount",
    })
    discounts = [{ coupon: stripeCoupon.id }]
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    discounts,
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
          customText: i.customText,
        }))
      ),
    },
  })

  return session
}
