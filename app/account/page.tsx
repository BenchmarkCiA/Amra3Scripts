export const dynamic = "force-dynamic"

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils/currency"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_preparation: { label: "In Preparation", color: "bg-warning/10 text-warning" },
  in_delivery:    { label: "In Delivery",    color: "bg-accent/10 text-accent" },
  waiting_for_pickup: { label: "Waiting for Pickup", color: "bg-blue-100 text-blue-700" },
  picked_up:      { label: "Picked Up",      color: "bg-success/10 text-success" },
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: customer } = await admin
    .from("customers")
    .select("full_name, first_name, email")
    .eq("id", user!.id)
    .single()

  const displayName = customer?.full_name
    ?? customer?.first_name
    ?? user!.email?.split("@")[0]
    ?? "there"

  const { data: orders } = await admin
    .from("orders")
    .select("id, order_number, status, customer_status, total, currency, created_at, order_items(title, quantity, image_url)")
    .eq("customer_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Hi, {displayName} 👋</h1>
      <p className="text-muted-foreground text-sm mb-8">Here are all your orders.</p>

      {!orders?.length ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const statusInfo = order.customer_status
              ? STATUS_LABELS[order.customer_status as string]
              : null
            const items = order.order_items as { title: string; quantity: number; image_url: string | null }[]
            const firstImage = items?.[0]?.image_url ?? null

            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="bg-white rounded-2xl border border-border p-5 flex items-center gap-5 hover:border-accent transition-colors group"
              >
                {firstImage && (
                  <img
                    src={firstImage}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold text-sm">{order.order_number}</span>
                    {statusInfo ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Processing
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {items?.map(i => `${i.quantity}× ${i.title}`).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold">{formatPrice(order.total, order.currency ?? "USD")}</p>
                  <p className="text-xs text-accent mt-1 group-hover:underline">View details →</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
