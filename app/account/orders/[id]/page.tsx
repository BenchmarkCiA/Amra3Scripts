export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils/currency"

const STATUS_STEPS = [
  { key: "in_preparation",    label: "In Preparation" },
  { key: "in_delivery",       label: "In Delivery" },
  { key: "waiting_for_pickup",label: "Waiting for Pickup" },
  { key: "picked_up",         label: "Picked Up" },
]

type Props = { params: Promise<{ id: string }> }

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: order } = await admin
    .from("orders")
    .select("*, order_items(title, variant_title, quantity, unit_price, total_price, image_url)")
    .eq("id", id)
    .eq("customer_id", user!.id)
    .single()

  if (!order) notFound()

  const items = order.order_items as {
    title: string
    variant_title: string | null
    quantity: number
    unit_price: number
    total_price: number
    image_url: string | null
  }[]

  const currentStep = order.customer_status
    ? STATUS_STEPS.findIndex(s => s.key === order.customer_status)
    : -1

  const addr = order.shipping_address as {
    first_name?: string; last_name?: string
    address1?: string; address2?: string
    city?: string; state?: string; zip?: string; country?: string
  }

  return (
    <div className="max-w-2xl">
      <Link href="/account" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{order.order_number}</h1>
        <span className="text-sm text-muted-foreground">
          {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* Status stepper */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-4">
        <h2 className="font-semibold text-sm mb-5">Order Status</h2>
        <div className="relative flex justify-between">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
          {currentStep >= 0 && (
            <div
              className="absolute top-4 left-0 h-0.5 bg-accent transition-all"
              style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
          )}
          {STATUS_STEPS.map((step, i) => {
            const done = currentStep >= i
            return (
              <div key={step.key} className="relative flex flex-col items-center gap-2" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                  done ? "bg-accent border-accent text-white" : "bg-white border-muted text-muted-foreground"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-xs text-center leading-tight ${done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
        {currentStep < 0 && (
          <p className="text-sm text-muted-foreground text-center mt-4">Your order is being processed.</p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-4">
        <h2 className="font-semibold text-sm mb-4">Items</h2>
        <div className="flex flex-col gap-4">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.title}</p>
                {item.variant_title && <p className="text-xs text-muted-foreground">{item.variant_title}</p>}
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-sm">{formatPrice(item.total_price, order.currency ?? "USD")}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-5 pt-4 flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span><span>{formatPrice(order.subtotal, order.currency ?? "USD")}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span><span>−{formatPrice(order.discount, order.currency ?? "USD")}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base mt-1">
            <span>Total</span><span>{formatPrice(order.total, order.currency ?? "USD")}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-sm mb-3">Shipping Address</h2>
        <p className="text-sm text-muted-foreground">
          {[addr.first_name, addr.last_name].filter(Boolean).join(" ")}<br />
          {addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}<br />
          {[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}<br />
          {addr.country}
        </p>
        {order.tracking_number && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium">Tracking</p>
            {order.tracking_url ? (
              <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                {order.tracking_number}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">{order.tracking_number}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
