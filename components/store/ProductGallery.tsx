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

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        <Image
          src={sorted[selected].url}
          alt={sorted[selected].alt || title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selected ? "border-accent" : "border-transparent"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
