export const dynamic = "force-dynamic"

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import ProductCard from "@/components/store/ProductCard"
import type { Product } from "@/types"

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featured } = await supabase
    .from("products")
    .select("*, variants:product_variants(*), category:categories(*)")
    .eq("status", "active")
    .eq("is_featured", true)
    .limit(8)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-24 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to the Store</h1>
        <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Premium products, crafted with care and delivered to your door.
        </p>
        <Link
          href="/products"
          className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
        >
          Shop Now
        </Link>
      </section>

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
