"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Upload, X } from "lucide-react"
import Image from "next/image"

interface Category { id: string; name: string }

interface Variant {
  title: string
  sku: string
  price: string
  compare_at_price: string
  inventory: string
  options: Record<string, string>
}

interface InitialProduct {
  id: string
  title: string
  description: string | null
  category_id: string | null
  status: "draft" | "active" | "archived"
  is_featured: boolean
  tags: string[]
  images: { url: string; alt: string }[]
  seo_title: string | null
  seo_description: string | null
  variants: {
    title: string
    sku: string | null
    price: number
    compare_at_price: number | null
    inventory: number
    options: Record<string, string>
  }[]
}

interface Props {
  categories: Category[]
  product?: InitialProduct
}

const emptyVariant = (): Variant => ({
  title: "",
  sku: "",
  price: "",
  compare_at_price: "",
  inventory: "-1",
  options: {},
})

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(product?.title ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "")
  const [status, setStatus] = useState<"draft" | "active">(
    (product?.status === "active" ? "active" : "draft")
  )
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false)
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "")
  const [seoTitle, setSeoTitle] = useState(product?.seo_title ?? "")
  const [seoDescription, setSeoDescription] = useState(product?.seo_description ?? "")

  const [images, setImages] = useState<{ url: string; alt: string }[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(false)

  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.length
      ? product.variants.map(v => ({
          title: v.title,
          sku: v.sku ?? "",
          price: String(v.price),
          compare_at_price: v.compare_at_price != null ? String(v.compare_at_price) : "",
          inventory: String(v.inventory ?? -1),
          options: v.options ?? {},
        }))
      : [emptyVariant()]
  )

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      if (data.url) {
        setImages((prev) => [...prev, { url: data.url, alt: title || file.name }])
      }
    }
    setUploading(false)
    e.target.value = ""
  }

  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i))

  const updateVariant = (i: number, field: keyof Variant, value: string) =>
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v))

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()])

  const removeVariant = (i: number) =>
    setVariants((prev) => prev.filter((_, idx) => idx !== i))

  const buildPayload = () => ({
    title: title.trim(),
    description: description.trim() || null,
    category_id: categoryId || null,
    tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    status,
    is_featured: isFeatured,
    images: images.map((img, i) => ({ ...img, position: i })),
    seo_title: seoTitle.trim() || null,
    seo_description: seoDescription.trim() || null,
    variants: variants
      .filter(v => v.title && v.price)
      .map(v => ({
        title: v.title,
        sku: v.sku || null,
        price: parseFloat(v.price),
        compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
        inventory: parseInt(v.inventory) || -1,
        options: v.options,
      })),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) { setError("Title is required"); return }
    if (!variants.some(v => v.price && parseFloat(v.price) > 0)) {
      setError("At least one variant with a price is required")
      return
    }

    setSaving(true)
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to save product"); return }

      router.push("/admin/products")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!product || !confirm(`Delete "${product.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" })
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to delete"); return }
      router.push("/admin/products")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* Basic info */}
      <section className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-base">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Title <span className="text-destructive">*</span></label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Classic Logo T-Shirt"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the product..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">No category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as "draft" | "active")}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags <span className="text-muted-foreground text-xs">(comma separated)</span></label>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. summer, sale, new"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={e => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <span className="text-sm font-medium">Feature on homepage</span>
        </label>
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl border border-border p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-base">Images</h2>

        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
              <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <label className={`w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-accent transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{uploading ? "Uploading..." : "Add image"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <p className="text-xs text-muted-foreground">First image will be used as the product thumbnail. Drag to reorder (coming soon).</p>
      </section>

      {/* Variants */}
      <section className="bg-white rounded-xl border border-border p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Variants <span className="text-muted-foreground text-xs font-normal">(price, size, color, etc.)</span></h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-sm text-accent hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add variant
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {variants.map((v, i) => (
            <div key={i} className="border border-border rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Variant {i + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Variant Title <span className="text-destructive">*</span></label>
                  <input
                    value={v.title}
                    onChange={e => updateVariant(i, "title", e.target.value)}
                    placeholder='e.g. "Black / M" or "Default"'
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">SKU</label>
                  <input
                    value={v.sku}
                    onChange={e => updateVariant(i, "sku", e.target.value)}
                    placeholder="SKU-001"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Price (USD) <span className="text-destructive">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.price}
                    onChange={e => updateVariant(i, "price", e.target.value)}
                    placeholder="29.99"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Compare at Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.compare_at_price}
                    onChange={e => updateVariant(i, "compare_at_price", e.target.value)}
                    placeholder="39.99"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Inventory</label>
                  <input
                    type="number"
                    value={v.inventory}
                    onChange={e => updateVariant(i, "inventory", e.target.value)}
                    placeholder="-1 = unlimited"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO */}
      <section className="bg-white rounded-xl border border-border p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-base">SEO <span className="text-muted-foreground text-xs font-normal">(optional)</span></h2>
        <div>
          <label className="block text-sm font-medium mb-1">SEO Title</label>
          <input
            value={seoTitle}
            onChange={e => setSeoTitle(e.target.value)}
            placeholder="Defaults to product title"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">SEO Description</label>
          <textarea
            value={seoDescription}
            onChange={e => setSeoDescription(e.target.value)}
            rows={2}
            placeholder="Defaults to first 160 chars of description"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
        </div>
      </section>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={saving || deleting}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving || deleting}
          className="px-6 py-2.5 rounded-lg font-medium text-sm border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
            className="ml-auto px-6 py-2.5 rounded-lg font-medium text-sm text-destructive border border-destructive/30 hover:bg-destructive/5 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Product"}
          </button>
        )}
      </div>
    </form>
  )
}
