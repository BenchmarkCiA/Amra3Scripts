"use client"

import { useState } from "react"
import { Trash2, Pencil, Plus, X, Check } from "lucide-react"

interface Review {
  id: string
  reviewer_name: string
  rating: number
  body: string | null
  created_at: string
}

function Stars({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || rating
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <svg width={18} height={18} viewBox="0 0 20 20" fill={i <= display ? "#FBBF24" : "#E5E7EB"}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </span>
  )
}

export default function ProductReviewsPanel({
  productId,
  initialReviews,
}: {
  productId: string
  initialReviews: Review[]
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function startAdd() {
    setAdding(true)
    setEditingId(null)
    setName("")
    setRating(5)
    setBody("")
    setError("")
  }

  function startEdit(r: Review) {
    setEditingId(r.id)
    setAdding(false)
    setName(r.reviewer_name)
    setRating(r.rating)
    setBody(r.body ?? "")
    setError("")
  }

  function cancel() {
    setAdding(false)
    setEditingId(null)
    setError("")
  }

  async function saveNew() {
    if (!name.trim()) { setError("Name is required"); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewer_name: name.trim(), rating, body: body.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReviews((prev) => [data, ...prev])
      setAdding(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (!name.trim() || !editingId) { setError("Name is required"); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/products/${productId}/reviews/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewer_name: name.trim(), rating, body: body.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReviews((prev) => prev.map((r) => r.id === editingId ? data : r))
      setEditingId(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return
    const res = await fetch(`/api/products/${productId}/reviews/${id}`, { method: "DELETE" })
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-base">Reviews</h2>
          {avg && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Average {avg} / 5 · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
          )}
        </div>
        {!adding && !editingId && (
          <button
            type="button"
            onClick={startAdd}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add review
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {(adding || editingId) && (
        <div className="bg-muted/40 rounded-xl p-4 mb-5 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Reviewer name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah M."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5">Rating</label>
            <Stars rating={rating} onChange={setRating} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Review text <span className="text-muted-foreground">(optional)</span></label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="What did they say about the product?"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={adding ? saveNew : saveEdit}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? "Saving…" : adding ? "Add review" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Add the first one above.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {reviews.map((r) => (
            <div key={r.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={r.rating} />
                    <span className="font-medium text-sm">{r.reviewer_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  {r.body && <p className="text-sm text-muted-foreground leading-relaxed">{r.body}</p>}
                </div>
                {editingId !== r.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteReview(r.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
