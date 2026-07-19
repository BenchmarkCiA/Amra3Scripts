export const dynamic = "force-dynamic"

import { createAdminClient } from "@/lib/supabase/admin"

export default async function AdminCustomersPage() {
  const supabase = createAdminClient()

  const { data: customers } = await supabase
    .from("customers")
    .select("id, email, full_name, first_name, last_name, marketing_consent, created_at")
    .order("created_at", { ascending: false })

  const marketingCount = customers?.filter(c => c.marketing_consent).length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {customers?.length ?? 0} registered · {marketingCount} opted in to marketing emails
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Marketing</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers?.map((c) => {
              const name = c.full_name
                ?? ([c.first_name, c.last_name].filter(Boolean).join(" ") || "—")
              return (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.email}</td>
                  <td className="px-6 py-4">
                    {c.marketing_consent ? (
                      <span className="flex items-center gap-1.5 text-success font-medium text-xs">
                        <span className="w-2 h-2 rounded-full bg-success inline-block" />
                        Opted in
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" />
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              )
            })}
            {!customers?.length && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  No registered customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
