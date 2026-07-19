export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils/currency"
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater"

type Props = { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(title, variant_title, quantity, unit_price, total_price, image_url)")
    .eq("id", id)
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

  const addr = order.shipping_address as {
    first_name?: string; last_name?: string
    address1?: string; address2?: string
    city?: string; state?: string; zip?: string; country?: string
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {/* Customer status updater */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Customer Fulfillment Status</h2>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.customer_status as string | null} />
        </div>

        {/* Order items */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="flex flex-col gap-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  {item.variant_title && <p className="text-xs text-muted-foreground">{item.variant_title}</p>}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.unit_price, "USD")}</p>
                </div>
                <p className="font-medium text-sm">{formatPrice(item.total_price, "USD")}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatPrice(order.subtotal, "USD")}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span><span>−{formatPrice(order.discount, "USD")}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold mt-1">
              <span>Total</span><span>{formatPrice(order.total, "USD")}</span>
            </div>
          </div>
        </div>

        {/* Customer & shipping */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-sm mb-3">Customer</h2>
            <p className="text-sm">{order.customer_email}</p>
            {order.customer_id && (
              <Link href={`/admin/customers`} className="text-xs text-accent hover:underline mt-1 block">
                View customer →
              </Link>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-sm mb-3">Shipping Address</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {[addr.first_name, addr.last_name].filter(Boolean).join(" ")}<br />
              {addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}<br />
              {[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}<br />
              {addr.country}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-sm mb-3">Payment</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                order.status === "paid" ? "bg-success/10 text-success" :
                order.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                "bg-muted text-muted-foreground"
              }`}>{order.status}</span>
            </div>
            {order.stripe_payment_intent_id && (
              <div>
                <p className="text-muted-foreground text-xs">Stripe PI</p>
                <p className="font-mono text-xs truncate">{order.stripe_payment_intent_id}</p>
              </div>
            )}
            {order.tracking_number && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">Tracking</p>
                {order.tracking_url ? (
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm">
                    {order.tracking_number}
                  </a>
                ) : (
                  <p className="text-sm">{order.tracking_number}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
