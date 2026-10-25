export interface VariantInput {
  id?: string
  title: string
  sku: string | null
  price: number
  compare_at_price: number | null
  inventory: number
  options: Record<string, string>
}

/** Validates admin variant input. Returns normalized rows or an error message. */
export function normalizeVariants(raw: unknown): { variants: VariantInput[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) return { error: "At least one variant is required" }

  const variants: VariantInput[] = []
  for (const [i, r] of raw.entries()) {
    const v = r as Record<string, unknown>
    const label = `Variant ${i + 1}`
    const title = typeof v.title === "string" ? v.title.trim() : ""
    if (!title) return { error: `${label}: title is required` }

    const price = Number(v.price)
    if (!Number.isFinite(price) || price <= 0) return { error: `${label}: price must be greater than 0` }

    const compare = v.compare_at_price === null || v.compare_at_price === undefined || v.compare_at_price === ""
      ? null
      : Number(v.compare_at_price)
    if (compare !== null && (!Number.isFinite(compare) || compare < 0)) {
      return { error: `${label}: compare-at price is invalid` }
    }

    const inventory = v.inventory === undefined || v.inventory === null || v.inventory === "" ? -1 : Number(v.inventory)
    if (!Number.isInteger(inventory) || inventory < -1) {
      return { error: `${label}: inventory must be a whole number (-1 = unlimited)` }
    }

    variants.push({
      id: typeof v.id === "string" && v.id ? v.id : undefined,
      title,
      sku: typeof v.sku === "string" && v.sku.trim() ? v.sku.trim() : null,
      price: Math.round(price * 100) / 100,
      compare_at_price: compare === null ? null : Math.round(compare * 100) / 100,
      inventory,
      options: v.options && typeof v.options === "object" ? (v.options as Record<string, string>) : {},
    })
  }
  return { variants }
}
