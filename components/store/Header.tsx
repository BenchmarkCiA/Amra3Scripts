"use client"

import Link from "next/link"
import { ShoppingBag, Menu, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useCart } from "@/hooks/useCart"
import CartDrawer from "./CartDrawer"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openCart } = useCart()
  const count = itemCount()
  const [country, setCountry] = useState("il")
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("otzma_country")
    if (saved) setCountry(saved)
  }, [])

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [menuOpen])

  const base = `/${country}`

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={base} className="font-bold text-xl text-primary">
            Store
          </Link>

          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
            <Link href={`${base}/products`} className="text-sm font-medium hover:text-accent transition-colors">
              Products
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={count > 0 ? `Open cart, ${count} item${count !== 1 ? "s" : ""}` : "Open cart"}
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          hidden={!menuOpen}
          className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-4"
        >
          <nav aria-label="Mobile navigation">
            <Link
              href={`${base}/products`}
              className="block text-sm font-medium py-1"
              onClick={() => setMenuOpen(false)}
            >
              Products
            </Link>
          </nav>
        </div>
      </header>

      {/* Live region for cart count announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {count > 0 ? `Cart updated: ${count} item${count !== 1 ? "s" : ""}` : ""}
      </div>

      <CartDrawer />
    </>
  )
}
