import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/utils/currency"

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const firstImage = product.images?.[0]
  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v) => v.price))
    : null

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted mb-3">
        {firstImage ? (
          <Image
            src={firstImage.url}
            alt={firstImage.alt || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
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
        <p className="text-sm text-muted-foreground">
          From {formatPrice(lowestPrice, "USD")}
        </p>
      )}
    </Link>
  )
}
