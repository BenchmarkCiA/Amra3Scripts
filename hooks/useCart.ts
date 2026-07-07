"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  product_id: string
  variant_id: string
  quantity: number
  title: string
  variant_title: string
  price: number
  image_url?: string
  customText?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product_id: string, variant_id: string, quantity: number, customText?: string) => Promise<void>
  removeItem: (variant_id: string) => void
  updateQuantity: (variant_id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: async (product_id, variant_id, quantity, customText?) => {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id, variant_id, quantity }),
        })
        const data = await res.json()
        if (data.item) {
          const item = { ...data.item, ...(customText ? { customText } : {}) }
          set((state) => {
            const existing = state.items.find((i) => i.variant_id === variant_id)
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.variant_id === variant_id
                    ? { ...i, quantity: i.quantity + quantity, ...(customText ? { customText } : {}) }
                    : i
                ),
                isOpen: true,
              }
            }
            return { items: [...state.items, item], isOpen: true }
          })
        }
      },

      removeItem: (variant_id) =>
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variant_id),
        })),

      updateQuantity: (variant_id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variant_id !== variant_id)
              : state.items.map((i) =>
                  i.variant_id === variant_id ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
)
