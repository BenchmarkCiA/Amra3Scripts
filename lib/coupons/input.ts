const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** "2026-05-01" → start/end of that day (UTC); full timestamps pass through. */
function toTimestamp(v: unknown, endOfDay: boolean): string | null {
  if (typeof v !== "string" || !v) return null
  const iso = DATE_ONLY.test(v) ? `${v}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z` : v
  return Number.isNaN(Date.parse(iso)) ? null : new Date(iso).toISOString()
}

const idList = (v: unknown) =>
  Array.isArray(v) && v.length ? v.filter((x): x is string => typeof x === "string") : null

/**
 * Whitelists and validates admin coupon input. With `partial`, only provided
 * fields are validated (used by PATCH, e.g. the activate/deactivate toggle).
 */
export function sanitizeCouponInput(body: Record<string, unknown>, partial = false):
  { data: Record<string, unknown> } | { error: string } {
  const data: Record<string, unknown> = {}
  const has = (k: string) => k in body

  if (!partial || has("code")) {
    const code = typeof body.code === "string" ? body.code.toUpperCase().trim() : ""
    if (!/^[A-Z0-9_-]{2,40}$/.test(code)) return { error: "Code must be 2–40 letters, numbers, - or _" }
    data.code = code
  }
  if (!partial || has("type")) {
    if (body.type !== "percentage" && body.type !== "fixed") return { error: "Type must be percentage or fixed" }
    data.type = body.type
  }
  if (!partial || has("value")) {
    const value = Number(body.value)
    if (!Number.isFinite(value) || value <= 0) return { error: "Discount value must be greater than 0" }
    const type = (data.type ?? body.type) as string | undefined
    if (type === "percentage" && value > 100) return { error: "A percentage discount can't exceed 100%" }
    data.value = value
  }
  if (has("min_order_amount")) {
    const min = body.min_order_amount === null || body.min_order_amount === "" ? null : Number(body.min_order_amount)
    if (min !== null && (!Number.isFinite(min) || min < 0)) return { error: "Minimum order must be 0 or more" }
    data.min_order_amount = min || null
  }
  if (has("max_uses")) {
    const max = body.max_uses === null || body.max_uses === "" ? null : Number(body.max_uses)
    if (max !== null && (!Number.isInteger(max) || max < 1)) return { error: "Max uses must be a whole number of 1 or more" }
    data.max_uses = max
  }
  if (!partial || has("valid_from")) {
    const from = toTimestamp(body.valid_from, false)
    if (!from) return { error: "Start date is invalid" }
    data.valid_from = from
  }
  if (!partial || has("valid_until")) {
    // Date-only end dates include the whole day
    const until = toTimestamp(body.valid_until, true)
    if (!until) return { error: "End date is invalid" }
    data.valid_until = until
  }
  if (data.valid_from && data.valid_until && Date.parse(data.valid_until as string) < Date.parse(data.valid_from as string)) {
    return { error: "End date must be on or after the start date" }
  }
  if (has("product_ids")) data.product_ids = idList(body.product_ids)
  if (has("category_ids")) data.category_ids = idList(body.category_ids)
  if (has("is_active")) data.is_active = !!body.is_active
  else if (!partial) data.is_active = true

  return { data }
}
