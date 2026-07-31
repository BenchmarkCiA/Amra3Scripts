export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import ProductForm from "@/components/admin/ProductForm"
import ProductReviewsPanel from "@/components/admin/ProductReviewsPanel"

type Props = { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: product }, { data: categories }, { data: reviews }] = await Promise.all([
    supabase
      .from("products")
      .select("*, variants:product_variants(*), country_codes")
      .eq("id", id)
      .single(),
    supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: false }),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-3xl flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      <ProductForm
        categories={categories ?? []}
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          category_id: product.category_id,
          status: product.status,
          is_featured: product.is_featured,
          tags: product.tags ?? [],
          images: product.images ?? [],
          seo_title: product.seo_title,
          seo_description: product.seo_description,
          country_codes: product.country_codes ?? null,
          allow_personalization: product.allow_personalization ?? false,
          variants: (product.variants ?? []).map((v: {
            title: string
            sku: string | null
            price: number
            compare_at_price: number | null
            inventory: number
            options: Record<string, string>
          }) => ({
            title: v.title,
            sku: v.sku,
            price: v.price,
            compare_at_price: v.compare_at_price,
            inventory: v.inventory,
            options: v.options ?? {},
          })),
        }}
      />
      <ProductReviewsPanel productId={product.id} initialReviews={reviews ?? []} />
    </div>
  )
}
