"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import SocialIcons, { type SocialLinks } from "@/components/store/SocialIcons"

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null)

  useEffect(() => {
    clearCart()
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.social_links) setSocialLinks(data.social_links)
      })
      .catch(() => {})
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

      {socialLinks && (
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Follow us for inspiration &amp; updates</p>
          <div className="flex justify-center">
            <SocialIcons links={socialLinks} size="md" />
          </div>
        </div>
      )}
    </div>
  )
}
