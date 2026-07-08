import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import CouponActions from "@/components/admin/CouponActions"

export const dynamic = "force-dynamic"

function couponStatus(c: {
  is_active: boolean
  valid_until: string
  max_uses: number | null
  uses_count: number
}) {
  if (!c.is_active) return { label: "Inactive", color: "bg-muted text-muted-foreground" }
  if (new Date(c.valid_until) < new Date()) return { label: "Expired", color: "bg-destructive/10 text-destructive" }
  if (c.max_uses !== null && c.uses_count >= c.max_uses) return { label: "Used up", color: "bg-orange-100 text-orange-700" }
  return { label: "Active", color: "bg-green-100 text-green-700" }
}

export default async function CouponsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== process.env.ADMIN_EMAIL) redirect("/admin")

  const admin = createAdminClient()
  const { data: coupons } = await admin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          + New Coupon
        </Link>
      </div>

      {!coupons?.length ? (
        <p className="text-muted-foreground">No coupons yet. Create your first one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium">Valid until</th>
                <th className="text-left px-4 py-3 font-medium">Uses</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => {
                const status = couponStatus(c)
                return (
                  <tr key={c.id} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                    <td className="px-4 py-3">
                      {c.type === "percentage" ? `${c.value}%` : `$${Number(c.value).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(c.valid_until).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.uses_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <CouponActions id={c.id} isActive={c.is_active} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
