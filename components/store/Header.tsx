"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "@/hooks/useCart"
import CartDrawer from "./CartDrawer"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openCart } = useCart()
  const count = itemCount()
  const [country, setCountry] = useState("il")

  useEffect(() => {
    const saved = localStorage.getItem("otzma_country")
    if (saved) setCountry(saved)
  }, [])

  const base = `/${country}`

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={base} className="font-bold text-xl text-primary">
            Store
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href={`${base}/products`} className="text-sm font-medium hover:text-accent transition-colors">
              Products
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-4">
            <Link href={`${base}/products`} className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
              Products
            </Link>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  )
}
