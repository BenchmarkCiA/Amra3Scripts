import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/utils/currency"

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const firstImage = product.images?.[0]

  const cheapestVariant = product.variants?.length
    ? product.variants.reduce((a, b) => a.price <= b.price ? a : b)
    : null

  const lowestPrice = cheapestVariant?.price ?? null
  const compareAtPrice =
    cheapestVariant?.compare_at_price &&
    cheapestVariant.compare_at_price > (cheapestVariant.price ?? 0)
      ? cheapestVariant.compare_at_price
      : null

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white border border-border mb-3">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.alt || product.title}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm leading-tight mb-1 group-hover:text-accent transition-colors">
        {product.title}
      </h3>
      {lowestPrice !== null && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {(product.variants?.length ?? 0) > 1 ? "From " : ""}{formatPrice(lowestPrice, "USD")}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(compareAtPrice, "USD")}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}
