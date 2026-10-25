import Link from "next/link"
import { CheckCircle, AlertCircle } from "lucide-react"
import type { Metadata } from "next"
import { stripe } from "@/lib/stripe/client"
import { createAdminClient } from "@/lib/supabase/admin"
import SocialIcons, { type SocialLinks } from "@/components/store/SocialIcons"
import ClearCartOnMount from "@/components/store/ClearCartOnMount"

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } }

async function verify(sessionId: string | undefined) {
  if (!sessionId || !sessionId.startsWith("cs_")) return null
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== "paid" && session.status !== "complete") return null
    const orderId = session.metadata?.order_id ?? session.client_reference_id
    const admin = createAdminClient()
    const { data: order } = orderId
      ? await admin.from("orders").select("order_number").eq("id", orderId).maybeSingle()
      : { data: null }
    return {
      orderNumber: order?.order_number ?? null,
      email: session.customer_details?.email ?? null,
      pendingPayment: session.payment_status !== "paid",
    }
  } catch {
    return null
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const admin = createAdminClient()
  const [result, { data: social }] = await Promise.all([
    verify(session_id),
    admin.from("site_settings").select("value").eq("key", "social_links").maybeSingle(),
  ])
  const socialLinks = (social?.value ?? null) as SocialLinks | null

  if (!result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-6" aria-hidden="true" />
        <h1 className="text-2xl font-bold mb-3">We couldn&apos;t confirm this payment</h1>
        <p className="text-muted-foreground mb-8">
          If you completed a payment, you&apos;ll receive a confirmation email shortly. Your cart has been kept.
        </p>
        <Link
          href="/checkout"
          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to checkout
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <ClearCartOnMount />
      <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" aria-hidden="true" />
      <h1 className="text-3xl font-bold mb-3">
        {result.pendingPayment ? "Order received" : "Order confirmed!"}
      </h1>
      {result.orderNumber && (
        <p className="text-lg font-semibold mb-2">
          Order number: <span className="font-mono">{result.orderNumber}</span>
        </p>
      )}
      <p className="text-muted-foreground mb-2">
        {result.pendingPayment
          ? "We'll start preparing your order as soon as your payment clears."
          : "Thank you for your purchase."}
        {result.email ? ` A confirmation will be sent to ${result.email}.` : ""}
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        We&apos;ll notify you when your order ships.
      </p>
      <Link
        href="/products"
        className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
      >
        Continue Shopping
      </Link>

      {socialLinks && (
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Follow us for inspiration &amp; updates</p>
          <div className="flex justify-center">
            <SocialIcons links={socialLinks} size="md" />
          </div>
        </div>
      )}
    </div>
  )
}
