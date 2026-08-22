export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import ProductCard from "@/components/store/ProductCard"
import type { Product } from "@/types"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our full collection of products.",
}

interface SearchParams {
  category?: string
  sort?: string
  q?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("products")
    .select("*, variants:product_variants(*), category:categories(*)")
    .eq("status", "active")

  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single()
    if (cat) query = query.eq("category_id", cat.id)
  }

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`)
  }

  if (params.sort === "price_asc") {
    // Sort done client-side via variant price for now
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data: products } = await query

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position")

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="sr-only">All Products</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside aria-label="Product filters" className="w-full md:w-56 shrink-0">
          <nav aria-label="Filter by category">
            <h2 className="font-semibold text-lg mb-4">Categories</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products"
                  aria-current={!params.category ? "page" : undefined}
                  className={`block px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors ${!params.category ? "bg-muted font-medium" : ""}`}
                >
                  All Products
                </a>
              </li>
              {categories?.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`/products?category=${cat.slug}`}
                    aria-current={params.category === cat.slug ? "page" : undefined}
                    className={`block px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors ${params.category === cat.slug ? "bg-muted font-medium" : ""}`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Product grid */}
        <section aria-label="Product listing" className="flex-1">
          <p className="text-muted-foreground text-sm mb-6" aria-live="polite" aria-atomic="true">
            {products?.length ?? 0} product{(products?.length ?? 0) !== 1 ? "s" : ""} found
          </p>

          {products && products.length > 0 ? (
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0">
              {products.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product as Product} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-24 text-muted-foreground">
              No products found.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
