"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Category {
  id?: string
  name?: string
  slug?: string
  description?: string
  image_url?: string
  position?: number
  is_active?: boolean
}

interface Props {
  category?: Category
}

export default function CategoryForm({ category }: Props) {
  const router = useRouter()
  const isEdit = !!category?.id
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image_url: category?.image_url ?? "",
    position: category?.position ?? 0,
    is_active: category?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const url = isEdit ? `/api/admin/categories/${category!.id}` : "/api/admin/categories"
      const method = isEdit ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: form.slug || form.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
          description: form.description || null,
          image_url: form.image_url || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed")
      router.push("/admin/categories")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          required
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Clothing"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Slug <span className="text-muted-foreground font-normal">(auto-generated if empty)</span>
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="e.g. clothing"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Optional description"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <input
          type="url"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          placeholder="https://..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <input
            type="number"
            min="0"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground mt-1">Lower number = shown first</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Visible</label>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Show on store</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
