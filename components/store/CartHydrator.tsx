"use client"

import { useEffect } from "react"
import { useCart } from "@/hooks/useCart"

/** Loads the persisted cart after hydration to avoid server/client markup mismatches. */
export default function CartHydrator() {
  useEffect(() => {
    useCart.persist.rehydrate()
  }, [])
  return null
}
