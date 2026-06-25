import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { submitPrintifyOrder } from "@/lib/printify/orders"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    await handleCheckoutComplete(session)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()

  const items = JSON.parse(session.metadata?.items ?? "[]") as {
    product_id: string
    variant_id: string
    quantity: number
  }[]

  if (!items.length) return

  // Fetch variant + product data
  const variantIds = items.map((i) => i.variant_id)
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*, product:products(id, title, type, images)")
    .in("id", variantIds)

  if (!variants) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shipping = (session as any).shipping_details ?? (session as any).shipping
  const shippingAddress = {
    first_name: shipping?.name?.split(" ")[0] ?? session.customer_details?.name?.split(" ")[0] ?? "",
    last_name: shipping?.name?.split(" ").slice(1).join(" ") ?? session.customer_details?.name?.split(" ").slice(1).join(" ") ?? "",
    address1: shipping?.address?.line1 ?? session.customer_details?.address?.line1 ?? "",
    address2: shipping?.address?.line2 ?? session.customer_details?.address?.line2 ?? "",
    city: shipping?.address?.city ?? session.customer_details?.address?.city ?? "",
    state: shipping?.address?.state ?? session.customer_details?.address?.state ?? "",
    zip: shipping?.address?.postal_code ?? session.customer_details?.address?.postal_code ?? "",
    country: shipping?.address?.country ?? session.customer_details?.address?.country ?? "",
  }

  const subtotal = (session.amount_subtotal ?? 0) / 100
  const total = (session.amount_total ?? 0) / 100
  const orderNumber = `ORD-${await nextOrderNumber(supabase)}`

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_email: session.customer_details?.email ?? "",
      status: "paid",
      stripe_payment_intent_id: session.payment_intent as string,
      subtotal,
      total,
      currency: session.currency?.toUpperCase() ?? "USD",
      shipping_address: shippingAddress,
    })
    .select()
    .single()

  if (error || !order) {
    console.error("Failed to create order:", error)
    return
  }

  // Insert order items
  const orderItems = items.map((item) => {
    const variant = variants.find((v) => v.id === item.variant_id)
    const product = variant?.product as { id: string; title: string; type: string; images: { url: string }[] }
    return {
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_type: product?.type ?? "manual",
      title: product?.title ?? "",
      variant_title: variant?.title ?? "",
      sku: variant?.sku ?? null,
      quantity: item.quantity,
      unit_price: variant?.price ?? 0,
      total_price: (variant?.price ?? 0) * item.quantity,
      image_url: product?.images?.[0]?.url ?? null,
    }
  })

  await supabase.from("order_items").insert(orderItems)

  // Submit to Printify if any items are POD
  const hasPrintify = orderItems.some((i) => i.product_type === "printify")
  if (hasPrintify) {
    await submitPrintifyOrder(order.id, variants, items, shippingAddress)
  }
}

async function nextOrderNumber(supabase: ReturnType<typeof createAdminClient>): Promise<number> {
  const { data } = await supabase.rpc("nextval", { seq: "order_number_seq" }).single()
  return (data as number) ?? Date.now()
}
