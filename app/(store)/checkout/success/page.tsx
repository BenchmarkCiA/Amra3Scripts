"use client"

import { useEffect } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { useCart } from "@/hooks/useCart"

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle className="w-16 h-16 text-success mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-3">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-2">
        Thank you for your purchase. You&apos;ll receive a confirmation email shortly.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        We&apos;ll notify you when your order ships.
      </p>
      <Link
        href="/products"
        className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
