import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import CategoryActions from "@/components/admin/CategoryActions"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== process.env.ADMIN_EMAIL) redirect("/admin")

  const admin = createAdminClient()
  const { data: categories } = await admin
    .from("categories")
    .select("*, products(count)")
    .order("position", { ascending: true })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          + New Category
        </Link>
      </div>

      {!categories?.length ? (
        <p className="text-muted-foreground">No categories yet. Create your first one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Products</th>
                <th className="text-left px-4 py-3 font-medium">Position</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="bg-card hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(cat.products as { count: number }[])?.[0]?.count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.position}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      cat.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                    }`}>
                      {cat.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryActions id={cat.id} isActive={cat.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
