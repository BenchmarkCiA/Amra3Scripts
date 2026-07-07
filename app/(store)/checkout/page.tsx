"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/utils/currency"

export default function CheckoutPage() {
  const { items, total } = useCart()
  const [loading, setLoading] = useState(false)

  const cartTotal = total()

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <a href="/products" className="text-accent hover:underline">
          Continue Shopping
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Order summary */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.variant_id} className="py-4 flex justify-between gap-4">
                <div className="flex gap-3">
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover bg-muted"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    {item.variant_title && (
                      <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                    )}
                    {item.customText && (
                      <p className="text-xs text-accent font-medium">✏ {item.customText}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-sm shrink-0">
                  {formatPrice(item.price * item.quantity, "USD")}
                </p>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(cartTotal, "USD")}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col justify-start gap-6">
          <p className="text-sm text-muted-foreground">
            You&apos;ll be redirected to our secure checkout powered by Stripe. No card details are stored on our servers.
          </p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Redirecting..." : `Pay ${formatPrice(cartTotal, "USD")}`}
          </button>
        </div>
      </div>
    </div>
  )
}
