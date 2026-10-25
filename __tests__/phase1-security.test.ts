import { describe, it, expect } from "vitest"
import { evaluateCoupon, type CouponRow } from "../lib/coupons/calculate"
import { parseRequestedItems, PricingError } from "../lib/orders/pricing"
import { safeHref, safeRedirectPath } from "../lib/utils/safeUrl"
import { isValidCountry } from "../lib/countries"
import { checkImageUpload } from "../lib/utils/imageUpload"
import { sanitizePopupSettings } from "../lib/popup/settings"

const baseCoupon: CouponRow = {
  code: "SAVE10", type: "percentage", value: 10, min_order_amount: null, max_uses: null, uses_count: 0,
  valid_from: "2020-01-01T00:00:00Z", valid_until: "2099-01-01T00:00:00Z",
  product_ids: null, category_ids: null, is_active: true,
}
const line = (over: Partial<{ product_id: string; category_id: string | null; unit_price: number; quantity: number }> = {}) =>
  ({ product_id: "p1", category_id: "c1", unit_price: 50, quantity: 2, ...over })

describe("evaluateCoupon", () => {
  it("applies percentage to server prices", () => {
    expect(evaluateCoupon(baseCoupon, [line()])).toEqual({ valid: true, code: "SAVE10", discount: 10 })
  })
  it("caps percentage at 100%", () => {
    const r = evaluateCoupon({ ...baseCoupon, value: 150 }, [line()])
    expect(r.valid && r.discount).toBe(100)
  })
  it("caps fixed discount at subtotal", () => {
    const r = evaluateCoupon({ ...baseCoupon, type: "fixed", value: 500 }, [line()])
    expect(r.valid && r.discount).toBe(100)
  })
  it("intersects product and category restrictions", () => {
    const c = { ...baseCoupon, product_ids: ["p1", "p2"], category_ids: ["c2"] }
    const r = evaluateCoupon(c, [line({ product_id: "p1", category_id: "c1" }), line({ product_id: "p2", category_id: "c2" })])
    expect(r.valid && r.discount).toBe(10)
  })
  it("rejects expired, exhausted and inactive coupons", () => {
    expect(evaluateCoupon({ ...baseCoupon, valid_until: "2000-01-01" }, [line()]).valid).toBe(false)
    expect(evaluateCoupon({ ...baseCoupon, max_uses: 1, uses_count: 1 }, [line()]).valid).toBe(false)
    expect(evaluateCoupon({ ...baseCoupon, is_active: false }, [line()]).valid).toBe(false)
  })
  it("enforces minimum order amount", () => {
    expect(evaluateCoupon({ ...baseCoupon, min_order_amount: 500 }, [line()]).valid).toBe(false)
  })
})

describe("parseRequestedItems (price tampering)", () => {
  it("drops client-supplied price/title fields", () => {
    const [item] = parseRequestedItems([{ product_id: "p", variant_id: "v", quantity: 1, price: 0.01, title: "x" }])
    expect(item).toEqual({ product_id: "p", variant_id: "v", quantity: 1, customText: undefined })
  })
  it("rejects bad quantities", () => {
    for (const quantity of [0, -1, 1.5, 21, "abc"]) {
      expect(() => parseRequestedItems([{ product_id: "p", variant_id: "v", quantity }])).toThrow(PricingError)
    }
  })
  it("rejects empty carts", () => {
    expect(() => parseRequestedItems([])).toThrow(PricingError)
  })
})

describe("safe URLs", () => {
  it("blocks open redirects", () => {
    expect(safeRedirectPath("@evil.com")).toBe("/")
    expect(safeRedirectPath("//evil.com")).toBe("/")
    expect(safeRedirectPath("https://evil.com")).toBe("/")
    expect(safeRedirectPath("/admin/orders")).toBe("/admin/orders")
  })
  it("blocks javascript: links in popup CTA", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull()
    expect(safeHref("http://x.com")).toBeNull()
    expect(safeHref("https://x.com/a")).toBe("https://x.com/a")
    expect(safeHref("/il")).toBe("/il")
  })
  it("rejects unsafe popup settings", () => {
    expect(() => sanitizePopupSettings({ cta_url: "javascript:alert(1)" })).toThrow()
    expect(sanitizePopupSettings({ evil: 1, enabled: "yes" })).toEqual({ enabled: true })
  })
})

describe("isValidCountry", () => {
  it("rejects prototype keys", () => {
    expect(isValidCountry("constructor")).toBe(false)
    expect(isValidCountry("toString")).toBe(false)
    expect(isValidCountry("il")).toBe(true)
  })
})

describe("checkImageUpload", () => {
  it("rejects SVG/HTML and oversize files", () => {
    expect("error" in checkImageUpload(new File(["<svg/>"], "a.svg", { type: "image/svg+xml" }))).toBe(true)
    expect("error" in checkImageUpload(new File(["x"], "a.html", { type: "text/html" }))).toBe(true)
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "a.png", { type: "image/png" })
    expect("error" in checkImageUpload(big)).toBe(true)
    expect(checkImageUpload(new File(["x"], "a.whatever", { type: "image/png" }))).toEqual({ ext: "png", type: "image/png" })
  })
})
