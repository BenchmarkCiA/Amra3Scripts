"use client"

import { useState } from "react"
import { X, Minus, Plus, Trash2, Tag } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/utils/currency"

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, couponCode, discountAmount, applyCoupon, removeCoupon } = useCart()
  const [couponInput, setCouponInput] = useState("")
  const [couponError, setCouponError] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const cartTotal = total()
  const finalTotal = Math.max(0, cartTotal - discountAmount)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError("")
    const result = await applyCoupon(couponInput.trim())
    setCouponLoading(false)
    if (result.success) {
      setCouponInput("")
    } else {
      setCouponError(result.message ?? "Invalid coupon")
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-lg">Your Cart ({items.length})</h2>
          <button onClick={closeCart} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <p>Your cart is empty</p>
              <button onClick={closeCart} className="text-accent hover:underline text-sm">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {items.map((item) => (
                <li key={item.variant_id} className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-muted shrink-0 overflow-hidden">
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    {item.variant_title && (
                      <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                    )}
                    {item.customText && (
                      <p className="text-xs text-accent font-medium mt-0.5">&#9999; {item.customText}</p>
                    )}
                    <p className="text-sm font-semibold mt-1">{formatPrice(item.price, "USD")}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                        className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                        className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.variant_id)}
                        className="ml-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-border space-y-4">
            {/* Coupon section */}
            {couponCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-green-700">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">{couponCode}</span>
                  <span className="text-sm">&minus;{formatPrice(discountAmount, "USD")}</span>
                </div>
                <button onClick={removeCoupon} className="text-green-600 hover:text-green-800 text-xs underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError("") }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
              </div>
            )}

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartTotal, "USD")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Discount</span>
                  <span>&minus;{formatPrice(discountAmount, "USD")}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-1 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(finalTotal, "USD")}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-primary text-primary-foreground text-center py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
