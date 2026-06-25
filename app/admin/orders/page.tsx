export const dynamic = "force-dynamic"

import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils/currency"

export default async function AdminOrdersPage() {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Orders</h1>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Order #</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Customer</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Fulfillment</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Total</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Date</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-mono font-medium">{order.order_number}</td>
                <td className="px-6 py-4 text-muted-foreground">{order.customer_email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "paid" ? "bg-success/10 text-success" :
                    order.status === "shipped" ? "bg-accent/10 text-accent" :
                    order.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.fulfillment_status === "fulfilled" ? "bg-success/10 text-success" :
                    order.fulfillment_status === "partial" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {order.fulfillment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatPrice(order.total, "USD")}
                </td>
                <td className="px-6 py-4 text-right text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-accent hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
