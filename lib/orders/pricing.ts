import type { SupabaseClient } from "@supabase/supabase-js"

export const MAX_QTY_PER_LINE = 20
export const MAX_LINES = 50

export interface RequestedItem {
  product_id: string
  variant_id: string
  quantity: number
  customText?: string
}

export interface PricedLine {
  product_id: string
  variant_id: string
  quantity: number
  custom_text: string | null
  unit_price: number
  title: string
  variant_title: string
  sku: string | null
  image_url: string | null
  product_type: "printify" | "manual"
  category_id: string | null
  printify_product_id: string | null
  printify_variant_id: string | null
}

export class PricingError extends Error {}

interface VariantRow {
  id: string
  product_id: string
  title: string
  sku: string | null
  price: number | string
  inventory: number | null
  is_available: boolean
  printify_variant_id: string | null
  product: {
    id: string
    title: string
    type: "printify" | "manual"
    status: string
    images: { url: string }[] | null
    category_id: string | null
    printify_id: string | null
    allow_personalization: boolean | null
  } | null
}

/** Validates raw client input. Never trusts client-supplied prices or titles. */
export function parseRequestedItems(raw: unknown): RequestedItem[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new PricingError("Your cart is empty")
  if (raw.length > MAX_LINES) throw new PricingError("Too many items in cart")
  return raw.map((r) => {
    const item = r as Record<string, unknown>
    const quantity = Number(item.quantity)
    if (typeof item.variant_id !== "string" || typeof item.product_id !== "string") {
      throw new PricingError("Invalid cart item")
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_LINE) {
      throw new PricingError(`Quantity must be between 1 and ${MAX_QTY_PER_LINE}`)
    }
    const customText = typeof item.customText === "string" ? item.customText.trim().slice(0, 22) : undefined
    return { product_id: item.product_id, variant_id: item.variant_id, quantity, customText: customText || undefined }
  })
}

/** Looks up authoritative prices and product data for each requested line. */
export async function priceItems(supabase: SupabaseClient, items: RequestedItem[]): Promise<PricedLine[]> {
  const ids = [...new Set(items.map((i) => i.variant_id))]
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, title, sku, price, inventory, is_available, printify_variant_id, " +
        "product:products(id, title, type, status, images, category_id, printify_id, allow_personalization)"
    )
    .in("id", ids)
  if (error) throw error

  const byId = new Map((data as unknown as VariantRow[]).map((v) => [v.id, v]))

  return items.map((item) => {
    const v = byId.get(item.variant_id)
    if (!v || !v.product || v.product_id !== item.product_id) {
      throw new PricingError("An item in your cart is no longer available")
    }
    if (!v.is_available || v.product.status !== "active") {
      throw new PricingError(`"${v.product.title}" is no longer available`)
    }
    if (v.inventory !== null && v.inventory >= 0 && v.inventory < item.quantity) {
      throw new PricingError(`Only ${v.inventory} left of "${v.product.title}"`)
    }
    const unit = Number(v.price)
    if (!Number.isFinite(unit) || unit <= 0) throw new PricingError("Invalid product price")

    return {
      product_id: v.product_id,
      variant_id: v.id,
      quantity: item.quantity,
      custom_text: v.product.allow_personalization ? item.customText ?? null : null,
      unit_price: unit,
      title: v.product.title,
      variant_title: v.title,
      sku: v.sku,
      image_url: v.product.images?.[0]?.url ?? null,
      product_type: v.product.type,
      category_id: v.product.category_id,
      printify_product_id: v.product.printify_id,
      printify_variant_id: v.printify_variant_id,
    }
  })
}
