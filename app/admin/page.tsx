export const dynamic = "force-dynamic"

import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils/currency"

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const [
    { count: productCount },
    { count: orderCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  const revenue = recentOrders?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0

  const stats = [
    { label: "Active Products", value: productCount ?? 0 },
    { label: "Total Orders", value: orderCount ?? 0 },
    { label: "Recent Revenue", value: formatPrice(revenue, "USD") },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Order</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recentOrders?.map((order) => (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <a href={`/admin/orders/${order.id}`} className="text-accent hover:underline font-mono">
                    {order.order_number}
                  </a>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{order.customer_email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "paid" ? "bg-success/10 text-success" :
                    order.status === "shipped" ? "bg-accent/10 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatPrice(order.total, "USD")}
                </td>
              </tr>
            ))}
            {!recentOrders?.length && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
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
