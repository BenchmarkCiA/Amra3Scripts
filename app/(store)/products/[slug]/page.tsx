import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import ProductGallery from "@/components/store/ProductGallery"
import ProductVariants from "@/components/store/ProductVariants"
import { ReviewSummary } from "@/components/store/ProductReviews"
import ProductReviews from "@/components/store/ProductReviews"
import ProductTrustBadges from "@/components/store/ProductTrustBadges"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from("products")
    .select("title, seo_title, seo_description, description, images")
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!product) return {}

  const images = product.images as { url: string }[]
  return {
    title: product.seo_title || product.title,
    description: product.seo_description || product.description?.slice(0, 160),
    openGraph: {
      images: images?.[0]?.url ? [images[0].url] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const { data: product } = await supabase
    .from("products")
    .select("*, variants:product_variants(*), category:categories(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!product) notFound()

  const { data: productReviews } = await adminSupabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <ProductGallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-6">
          {product.category && (
            <a
              href={`/products?category=${product.category.slug}`}
              className="text-sm text-accent hover:underline"
            >
              {product.category.name}
            </a>
          )}

          <ReviewSummary productId={product.id} initialReviews={productReviews ?? []} />

          <h1 className="text-3xl font-bold">{product.title}</h1>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <ProductVariants product={product} />

          <ProductTrustBadges limitedTimeLabel={product.limited_time_label} />
        </div>
      </div>

      <ProductReviews productId={product.id} initialReviews={productReviews ?? []} />
    </div>
  )
}
