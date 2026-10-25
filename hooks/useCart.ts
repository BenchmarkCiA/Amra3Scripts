"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  product_id: string
  variant_id: string
  quantity: number
  title: string
  variant_title: string
  price: number
  image_url?: string
  customText?: string
}

export const MAX_QTY = 20

/** A cart line is a variant + its personal text: "Dan" and "Noa" shirts stay separate. */
export const lineKey = (i: Pick<CartItem, "variant_id" | "customText">) => `${i.variant_id}::${i.customText ?? ""}`

type Result = { success: boolean; message?: string }

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  hasHydrated: boolean
  couponCode: string | null
  discountAmount: number
  couponMessage: string | null
  addItem: (product_id: string, variant_id: string, quantity: number, customText?: string) => Promise<Result>
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  applyCoupon: (code: string) => Promise<Result>
  removeCoupon: () => void
  total: () => number
  itemCount: () => number
}

async function validateCoupon(code: string, items: CartItem[]) {
  const res = await fetch("/api/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      items: items.map(({ product_id, variant_id, quantity, customText }) => ({ product_id, variant_id, quantity, customText })),
    }),
  })
  return res.json() as Promise<{ valid: boolean; code?: string; discount_amount?: number; message?: string }>
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => {
      // The discount depends on the cart contents, so re-check it with the server after every change
      let revalidateSeq = 0
      const revalidateCoupon = async () => {
        const { couponCode, items } = get()
        if (!couponCode) return
        if (!items.length) {
          set({ couponCode: null, discountAmount: 0, couponMessage: null })
          return
        }
        const seq = ++revalidateSeq
        try {
          const data = await validateCoupon(couponCode, items)
          if (seq !== revalidateSeq) return // a newer change superseded this check
          if (data.valid) set({ discountAmount: data.discount_amount ?? 0, couponMessage: null })
          else set({ couponCode: null, discountAmount: 0, couponMessage: `Coupon removed: ${data.message ?? "no longer valid"}` })
        } catch {
          // keep the last known discount; checkout recomputes it server-side anyway
        }
      }

      return {
        items: [],
        isOpen: false,
        hasHydrated: false,
        couponCode: null,
        discountAmount: 0,
        couponMessage: null,

        addItem: async (product_id, variant_id, quantity, customText) => {
          try {
            const res = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ product_id, variant_id, quantity }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data.item) {
              return { success: false, message: data.error ?? "This item is no longer available" }
            }
            const text = customText?.trim() || undefined
            const item: CartItem = { ...data.item, ...(text ? { customText: text } : {}) }
            const key = lineKey(item)
            set((state) => {
              const existing = state.items.find((i) => lineKey(i) === key)
              const items = existing
                ? state.items.map((i) =>
                    lineKey(i) === key ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QTY) } : i
                  )
                : [...state.items, item]
              return { items, isOpen: true }
            })
            revalidateCoupon()
            return { success: true }
          } catch {
            return { success: false, message: "Network error — please try again" }
          }
        },

        removeItem: (key) => {
          set((state) => ({ items: state.items.filter((i) => lineKey(i) !== key) }))
          revalidateCoupon()
        },

        updateQuantity: (key, quantity) => {
          set((state) => ({
            items:
              quantity <= 0
                ? state.items.filter((i) => lineKey(i) !== key)
                : state.items.map((i) => (lineKey(i) === key ? { ...i, quantity: Math.min(quantity, MAX_QTY) } : i)),
          }))
          revalidateCoupon()
        },

        clearCart: () => set({ items: [], couponCode: null, discountAmount: 0, couponMessage: null }),
        openCart: () => set({ isOpen: true }),
        closeCart: () => set({ isOpen: false }),

        applyCoupon: async (code: string) => {
          const items = get().items
          if (!items.length) return { success: false, message: "Your cart is empty" }
          try {
            const data = await validateCoupon(code, items)
            if (data.valid) {
              set({ couponCode: data.code ?? code, discountAmount: data.discount_amount ?? 0, couponMessage: null })
              return { success: true }
            }
            return { success: false, message: data.message ?? "Invalid coupon" }
          } catch {
            return { success: false, message: "Network error — please try again" }
          }
        },

        removeCoupon: () => set({ couponCode: null, discountAmount: 0, couponMessage: null }),

        total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      }
    },
    {
      name: "cart-storage",
      // UI state (drawer open) is not persisted
      partialize: (s) => ({ items: s.items, couponCode: s.couponCode, discountAmount: s.discountAmount }),
      // Rehydrated after mount (CartHydrator) so server and first client render match
      skipHydration: true,
      onRehydrateStorage: () => () => useCart.setState({ hasHydrated: true }),
    }
  )
)
