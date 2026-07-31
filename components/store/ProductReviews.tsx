"use client"

import { useEffect, useState } from "react"

interface Review {
  id: string
  reviewer_name: string
  rating: number
  body: string | null
  created_at: string
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= rating ? "#FBBF24" : "#E5E7EB"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

export function ReviewSummary({
  productId,
  initialReviews,
}: {
  productId: string
  initialReviews?: Review[]
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews ?? [])

  useEffect(() => {
    if (initialReviews) return
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {})
  }, [productId, initialReviews])

  if (!reviews.length) return null

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <a href="#reviews" className="flex items-center gap-2 group">
      <Stars rating={Math.round(avg)} />
      <span className="text-sm text-muted-foreground group-hover:underline">
        {avg.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
      </span>
    </a>
  )
}

export default function ProductReviews({
  productId,
  initialReviews,
}: {
  productId: string
  initialReviews?: Review[]
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews ?? [])

  useEffect(() => {
    if (initialReviews) return
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {})
  }, [productId, initialReviews])

  if (!reviews.length) return null

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <section id="reviews" className="mt-12 border-t border-border pt-10">
      <div className="flex items-baseline gap-4 mb-6">
        <h2 className="text-xl font-bold">Customer Reviews</h2>
        <div className="flex items-center gap-2">
          <Stars rating={Math.round(avg)} size={18} />
          <span className="text-sm text-muted-foreground">
            {avg.toFixed(1)} out of 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {reviews.map((r) => (
          <div key={r.id} className="border-b border-border pb-6 last:border-0">
            <div className="flex items-center gap-3 mb-2">
              <Stars rating={r.rating} size={15} />
              <span className="font-semibold text-sm">{r.reviewer_name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            {r.body && <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
