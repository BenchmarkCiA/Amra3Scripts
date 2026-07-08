"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  title: string
}

interface Category {
  id: string
  name: string
}

interface Props {
  products: Product[]
  categories: Category[]
}

export default function CouponForm({ products, categories }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const today = new Date().toISOString().slice(0, 10)
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)

  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    min_order_amount: "",
    max_uses: "",
    valid_from: today,
    valid_until: nextMonth,
    is_active: true,
  })
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const toggleProduct = (id: string) =>
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const toggleCategory = (id: string) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: parseFloat(form.value),
          min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          product_ids: selectedProducts.length ? selectedProducts : null,
          category_ids: selectedCategories.length ? selectedCategories : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create coupon")
      router.push("/admin/coupons")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Code *</label>
          <input
            required
            type="text"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="SAVE20"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type *</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed amount ($)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Value * {form.type === "percentage" ? "(%)" : "($)"}
          </label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            max={form.type === "percentage" ? "100" : undefined}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Min order amount ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.min_order_amount}
            onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
            placeholder="No minimum"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max uses</label>
          <input
            type="number"
            min="1"
            step="1"
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            placeholder="Unlimited"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Active</label>
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Coupon is active</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Valid from *</label>
          <input
            required
            type="date"
            value={form.valid_from}
            onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Valid until *</label>
          <input
            required
            type="date"
            value={form.valid_until}
            onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Restrict to categories{" "}
            <span className="text-muted-foreground font-normal">(leave empty = all)</span>
          </label>
          <div className="grid sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-border rounded-lg p-3">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Restrict to products{" "}
            <span className="text-muted-foreground font-normal">(leave empty = all)</span>
          </label>
          <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
            {products.map((p) => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(p.id)}
                  onChange={() => toggleProduct(p.id)}
                  className="w-4 h-4"
                />
                {p.title}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Coupon"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          className="px-6 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
