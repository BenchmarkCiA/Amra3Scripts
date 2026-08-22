"use client"

import { useState } from "react"
import Image from "next/image"
import type { ProductImage } from "@/types"

interface Props {
  images: ProductImage[]
  title: string
}

export default function ProductGallery({ images, title }: Props) {
  const [selected, setSelected] = useState(0)
  const sorted = [...(images || [])].sort((a, b) => a.position - b.position)

  if (!sorted.length) {
    return (
      <div className="aspect-square rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
        No image
      </div>
    )
  }

  const currentImg = sorted[selected]

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-xl overflow-hidden bg-white border border-border"
        aria-label={`Product image: ${currentImg.alt || title}`}
      >
        <Image
          src={currentImg.url}
          alt={currentImg.alt || title}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div
          role="tablist"
          aria-label="Product image thumbnails"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {sorted.map((img, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === selected}
              aria-label={`View image ${i + 1}${img.alt ? `: ${img.alt}` : ""}`}
              onClick={() => setSelected(i)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-white transition-colors ${
                i === selected ? "border-accent" : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                aria-hidden="true"
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
