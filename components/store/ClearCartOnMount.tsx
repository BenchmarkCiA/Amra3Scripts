"use client"

import { useEffect } from "react"
import { useCart } from "@/hooks/useCart"

/** Empties the cart once a payment has been verified server-side. */
export default function ClearCartOnMount() {
  const hasHydrated = useCart((s) => s.hasHydrated)
  const clearCart = useCart((s) => s.clearCart)
  useEffect(() => {
    if (hasHydrated) clearCart()
  }, [hasHydrated, clearCart])
  return null
}
