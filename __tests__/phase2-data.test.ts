import { describe, it, expect, beforeEach, vi } from "vitest"
import { normalizeVariants } from "../lib/products/variants"
import { sanitizeCouponInput } from "../lib/coupons/input"
import { slugify } from "../lib/utils/slug"
import { useCart, lineKey } from "../hooks/useCart"

describe("normalizeVariants", () => {
  it("keeps inventory 0 as sold out (not unlimited)", () => {
    const r = normalizeVariants([{ title: "M", price: 10, inventory: 0 }])
    expect("variants" in r && r.variants[0].inventory).toBe(0)
  })
  it("defaults blank inventory to unlimited", () => {
    const r = normalizeVariants([{ title: "M", price: 10, inventory: "" }])
    expect("variants" in r && r.variants[0].inventory).toBe(-1)
  })
  it("rejects missing title, zero/negative/NaN price", () => {
    expect("error" in normalizeVariants([{ title: "", price: 10 }])).toBe(true)
    expect("error" in normalizeVariants([{ title: "M", price: 0 }])).toBe(true)
    expect("error" in normalizeVariants([{ title: "M", price: -5 }])).toBe(true)
    expect("error" in normalizeVariants([{ title: "M", price: "abc" }])).toBe(true)
  })
  it("passes variant ids through for in-place updates", () => {
    const r = normalizeVariants([{ id: "abc", title: "M", price: 10 }])
    expect("variants" in r && r.variants[0].id).toBe("abc")
  })
})

describe("sanitizeCouponInput", () => {
  const valid = { code: "save10", type: "percentage", value: 10, valid_from: "2026-01-01", valid_until: "2026-01-31" }
  it("makes the end date inclusive (end of day)", () => {
    const r = sanitizeCouponInput(valid)
    expect("data" in r && r.data.valid_until).toBe("2026-01-31T23:59:59.999Z")
    expect("data" in r && r.data.code).toBe("SAVE10")
  })
  it("rejects percent > 100 and end before start", () => {
    expect("error" in sanitizeCouponInput({ ...valid, value: 150 })).toBe(true)
    expect("error" in sanitizeCouponInput({ ...valid, valid_until: "2025-12-01" })).toBe(true)
  })
  it("drops non-whitelisted fields on partial update", () => {
    const r = sanitizeCouponInput({ is_active: false, uses_count: 0, id: "x" }, true)
    expect("data" in r && r.data).toEqual({ is_active: false })
  })
})

describe("slugify", () => {
  it("keeps Hebrew letters", () => {
    expect(slugify("חולצת עוצמה 2026")).toBe("חולצת-עוצמה-2026")
    expect(slugify("Classic Tee!")).toBe("classic-tee")
  })
})

describe("cart line keys", () => {
  beforeEach(() => {
    useCart.setState({ items: [], couponCode: null, discountAmount: 0 })
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      item: { product_id: "p", variant_id: "v", quantity: 1, title: "Tee", variant_title: "M", price: 20 },
    }))))
  })

  it("keeps differently personalised items as separate lines", async () => {
    await useCart.getState().addItem("p", "v", 1, "Dan")
    await useCart.getState().addItem("p", "v", 1, "Noa")
    await useCart.getState().addItem("p", "v", 1, "Dan")
    const items = useCart.getState().items
    expect(items).toHaveLength(2)
    expect(items.find((i) => i.customText === "Dan")?.quantity).toBe(2)
    expect(items.find((i) => i.customText === "Noa")?.quantity).toBe(1)
  })

  it("removes only the targeted line", async () => {
    await useCart.getState().addItem("p", "v", 1, "Dan")
    await useCart.getState().addItem("p", "v", 1, "Noa")
    useCart.getState().removeItem(lineKey({ variant_id: "v", customText: "Dan" }))
    expect(useCart.getState().items.map((i) => i.customText)).toEqual(["Noa"])
  })

  it("reports failure when the item is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "This item is sold out" }), { status: 409 })))
    const r = await useCart.getState().addItem("p", "v", 1)
    expect(r).toEqual({ success: false, message: "This item is sold out" })
    expect(useCart.getState().items).toHaveLength(0)
  })
})
