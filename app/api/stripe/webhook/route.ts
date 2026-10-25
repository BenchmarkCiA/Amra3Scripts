import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/client"
import { createAdminClient } from "@/lib/supabase/admin"
import { submitPrintifyOrder } from "@/lib/printify/orders"
import { createPendingOrder } from "@/lib/orders/create"
import { priceItems, type RequestedItem } from "@/lib/orders/pricing"
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

  try {
    const session = event.data.object as Stripe.Checkout.Session
    switch (event.type) {
      case "checkout.session.completed":
        // Delayed payment methods complete later via async_payment_succeeded
        if (session.payment_status === "paid") await fulfillSession(session)
        break
      case "checkout.session.async_payment_succeeded":
        await fulfillSession(session)
        break
      case "checkout.session.async_payment_failed":
        await cancelSession(session)
        break
      case "checkout.session.expired":
        await discardAbandoned(session)
        break
    }
  } catch (err) {
    // Non-2xx makes Stripe retry; fulfillSession is idempotent
    console.error(`Webhook ${event.type} failed:`, err)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function shippingAddressFrom(session: Stripe.Checkout.Session) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = session as any
  const shipping = s.collected_information?.shipping_details ?? s.shipping_details ?? s.shipping
  const details = session.customer_details
  const name: string = shipping?.name ?? details?.name ?? ""
  const addr = shipping?.address ?? details?.address
  return {
    first_name: name.split(" ")[0] ?? "",
    last_name: name.split(" ").slice(1).join(" "),
    address1: addr?.line1 ?? "",
    address2: addr?.line2 ?? "",
    city: addr?.city ?? "",
    state: addr?.state ?? "",
    zip: addr?.postal_code ?? "",
    country: addr?.country ?? "",
    phone: details?.phone ?? "",
  }
}

/** Resolves the order for a session, creating one for sessions made before order-first checkout. */
async function resolveOrderId(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const fromMeta = session.metadata?.order_id ?? session.client_reference_id
  if (fromMeta) return fromMeta

  const { data: existing } = await supabase
    .from("orders").select("id").eq("stripe_session_id", session.id).maybeSingle()
  if (existing) return existing.id

  // Legacy sessions carried the cart in metadata
  const legacy = JSON.parse(session.metadata?.items ?? "[]") as RequestedItem[]
  if (!legacy.length) return null
  const lines = await priceItems(supabase, legacy).catch(() => null)
  if (!lines) return null
  const order = await createPendingOrder(supabase, {
    lines,
    email: session.customer_details?.email ?? "",
    customerId: null,
    currency: session.currency ?? "usd",
    discount: (session.total_details?.amount_discount ?? 0) / 100,
    couponCode: null,
  })
  await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id)
  return order.id
}

async function fulfillSession(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient()
  const orderId = await resolveOrderId(supabase, session)
  if (!orderId) {
    console.error("Webhook: no order for session", session.id)
    return
  }

  const email = session.customer_details?.email ?? ""
  const { data: customer } = email
    ? await supabase.from("customers").select("id").eq("email", email).maybeSingle()
    : { data: null }

  const shippingAddress = shippingAddressFrom(session)

  // Conditional update = idempotency: only the first delivery moves pending → paid
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      stripe_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      customer_email: email,
      ...(customer?.id ? { customer_id: customer.id } : {}),
      subtotal: (session.amount_subtotal ?? 0) / 100,
      discount: (session.total_details?.amount_discount ?? 0) / 100,
      total: (session.amount_total ?? 0) / 100,
      currency: (session.currency ?? "usd").toUpperCase(),
      shipping_address: shippingAddress,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id, coupon_code")
    .maybeSingle()
  if (error) throw error
  if (!order) return // already fulfilled (duplicate delivery) or cancelled

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("variant_id, quantity, product_type, variant:product_variants(printify_variant_id, product:products(printify_id))")
    .eq("order_id", order.id)
  if (itemsError) throw itemsError

  for (const item of items ?? []) {
    if (item.variant_id) {
      await supabase.rpc("decrement_inventory", { p_variant_id: item.variant_id, p_qty: item.quantity })
    }
  }

  if (order.coupon_code) {
    await supabase.rpc("increment_coupon_use", { p_code: order.coupon_code })
  }

  type Joined = { printify_variant_id: string | null; product: { printify_id: string | null } | null } | null
  const printifyLines = (items ?? [])
    .filter((i) => i.product_type === "printify")
    .map((i) => {
      const v = i.variant as unknown as Joined
      return {
        printify_product_id: v?.product?.printify_id ?? null,
        printify_variant_id: v?.printify_variant_id ?? null,
        quantity: i.quantity,
      }
    })
  if (printifyLines.length) {
    await submitPrintifyOrder(order.id, printifyLines, shippingAddress)
  }
}

/** Abandoned checkout: drop the never-paid order so it doesn't clutter admin/account views. */
async function discardAbandoned(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id ?? session.client_reference_id
  if (!orderId) return
  const supabase = createAdminClient()
  const { error } = await supabase.from("orders").delete().eq("id", orderId).eq("status", "pending")
  if (error) throw error
}

async function cancelSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id ?? session.client_reference_id
  if (!orderId) return
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "pending")
  if (error) throw error
}
