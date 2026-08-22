"use client"

import { useState, useId } from "react"
import { formatPrice } from "@/lib/utils/currency"
import { useCart } from "@/hooks/useCart"
import type { Product, ProductVariant } from "@/types"

interface Props {
  product: Product
}

export default function ProductVariants({ product }: Props) {
  const variants = product.variants ?? []
  const [selected, setSelected] = useState<ProductVariant | null>(
    variants.find((v) => v.is_available) ?? null
  )
  const [adding, setAdding] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const [customText, setCustomText] = useState("")
  const { addItem } = useCart()
  const personalId = useId()

  const optionKeys = variants.length ? Object.keys(variants[0]?.options ?? {}) : []

  const getOptionValues = (key: string) =>
    [...new Set(variants.map((v) => v.options[key]))]

  const selectOption = (key: string, value: string) => {
    const current = { ...selected?.options }
    current[key] = value
    const match = variants.find((v) =>
      Object.entries(current).every(([k, val]) => v.options[k] === val)
    )
    if (match) setSelected(match)
  }

  const handleAddToCart = async () => {
    if (!selected) return
    setAdding(true)
    setAnnouncement("")
    await addItem(product.id, selected.id, 1, customText.trim() || undefined)
    setAdding(false)
    setAnnouncement(`${product.title} added to cart`)
    setTimeout(() => setAnnouncement(""), 3000)
  }

  if (!variants.length) {
    return <p className="text-muted-foreground">No variants available.</p>
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Live region for cart announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {announcement}
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">
          {selected ? formatPrice(selected.price, "USD") : "—"}
        </span>
        {selected?.compare_at_price && selected.compare_at_price > selected.price && (
          <span className="text-muted-foreground line-through text-lg" aria-label={`Was ${formatPrice(selected.compare_at_price, "USD")}`}>
            {formatPrice(selected.compare_at_price, "USD")}
          </span>
        )}
      </div>

      {/* Option selectors — each group is a radio group */}
      {optionKeys.map((key) => (
        <fieldset key={key}>
          <legend className="text-sm font-medium mb-2 capitalize">{key}</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={key}>
            {getOptionValues(key).map((val) => {
              const isActive = selected?.options[key] === val
              const isAvailable = variants.some(
                (v) => v.options[key] === val && v.is_available
              )
              return (
                <button
                  key={val}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => selectOption(key, val)}
                  disabled={!isAvailable}
                  aria-disabled={!isAvailable}
                  aria-label={`${val}${!isAvailable ? " — unavailable" : ""}`}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors min-w-[44px] min-h-[44px]
                    ${isActive ? "border-accent bg-accent text-white" : "border-border hover:border-accent"}
                    ${!isAvailable ? "opacity-40 cursor-not-allowed line-through" : ""}
                  `}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}

      {/* Personal text */}
      {product.allow_personalization && (
        <div>
          <label htmlFor={personalId} className="block text-sm font-medium mb-1.5">
            Personal text <span className="text-muted-foreground font-normal">(printed on item)</span>
            <span className="sr-only"> — optional, maximum 22 characters</span>
          </label>
          <input
            id={personalId}
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            maxLength={22}
            placeholder="Your name, date, or message…"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <p className="text-xs text-muted-foreground mt-1" aria-live="polite">
            {customText.length}/22 characters
          </p>
        </div>
      )}

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={!selected || !selected.is_available || adding}
        aria-disabled={!selected || !selected.is_available || adding}
        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-base
          hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {adding ? "Adding…" : "Add to Cart"}
      </button>

      {selected && selected.inventory > 0 && selected.inventory <= 5 && (
        <p className="text-warning text-sm" role="status">
          Only {selected.inventory} left in stock
        </p>
      )}
    </div>
  )
}
