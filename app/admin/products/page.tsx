export const dynamic = "force-dynamic"

import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils/currency"

export default async function AdminProductsPage() {
  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from("products")
    .select("*, variants:product_variants(price), category:categories(name)")
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">Price from</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products?.map((p) => {
              const prices = (p.variants as { price: number }[])?.map((v) => v.price) ?? []
              const minPrice = prices.length ? Math.min(...prices) : null
              return (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{p.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.type === "printify" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {(p.category as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === "active" ? "bg-success/10 text-success" :
                      p.status === "draft" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {minPrice !== null ? formatPrice(minPrice, "USD") : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-accent hover:underline text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
            {!products?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="text-accent hover:underline">
                    Add one
                  </Link>{" "}
                  or{" "}
                  <Link href="/admin/products/printify" className="text-accent hover:underline">
                    sync from Printify
                  </Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
