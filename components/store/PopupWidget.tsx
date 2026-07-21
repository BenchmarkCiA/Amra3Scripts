"use client"

import { useEffect, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"

interface PopupSettings {
  enabled: boolean
  template: "discount" | "announcement" | "newsletter"
  timing: "delay" | "exit" | "scroll"
  timing_value: number
  frequency: "session" | "day" | "always"
  pages: "all" | "storefront"
  heading: string
  body: string
  coupon_code: string
  discount_percent: number
  cta_label: string
  cta_url: string
}

const STORAGE_KEY = "otzma_popup_seen"

function alreadySeen(frequency: string): boolean {
  if (frequency === "always") return false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (frequency === "session") {
      return !!sessionStorage.getItem(STORAGE_KEY)
    }
    if (frequency === "day") {
      return Date.now() - ts < 86_400_000
    }
  } catch {
    // ignore storage errors
  }
  return false
}

function markSeen(frequency: string) {
  try {
    if (frequency === "session") {
      sessionStorage.setItem(STORAGE_KEY, "1")
    } else {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    }
  } catch {
    // ignore
  }
}

// ─── Template: Discount ──────────────────────────────────────────────────────

function DiscountTemplate({
  settings,
  onClose,
}: {
  settings: PopupSettings
  onClose: () => void
}) {
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes("@")) { setError("Please enter a valid email."); return }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/popup/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, marketing_consent: consent }),
      })
      const data = await res.json()
      setCoupon(data.coupon ?? null)
      setDone(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-col md:flex-row w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-white">
      {/* Left panel */}
      <div className="bg-gray-900 text-white flex flex-col justify-center px-8 py-10 md:w-5/12">
        <div className="text-4xl font-black text-yellow-400 mb-1">
          {settings.discount_percent}%
        </div>
        <div className="text-xl font-bold uppercase tracking-wide mb-2">OFF</div>
        <p className="text-gray-300 text-sm leading-relaxed">
          {settings.heading || "Exclusive offer for new subscribers"}
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 px-8 py-10 flex flex-col justify-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!done ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {settings.heading || "Get your discount"}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {settings.body || "Enter your email and get an exclusive discount code."}
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/30"
                required
              />
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 accent-gray-900"
                />
                <span className="text-xs text-gray-500 leading-snug">
                  I agree to receive promotional emails and marketing communications.
                  I can unsubscribe at any time.
                </span>
              </label>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Sending…" : `Get ${settings.discount_percent}% Off`}
              </button>
            </form>
          </>
        ) : coupon ? (
          <div className="text-center">
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Here&apos;s your code!</h2>
            <p className="text-sm text-gray-500 mb-4">Use it at checkout:</p>
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl py-3 px-6 mb-5">
              <span className="text-2xl font-black tracking-widest text-gray-900">{coupon}</span>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              {settings.cta_label || "Shop Now"}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-3">✅</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">You&apos;re in!</h2>
            <p className="text-sm text-gray-500 mb-5">Thanks for joining. Enjoy browsing our collection.</p>
            <button
              onClick={onClose}
              className="bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              {settings.cta_label || "Shop Now"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Template: Announcement ──────────────────────────────────────────────────

function AnnouncementTemplate({
  settings,
  onClose,
}: {
  settings: PopupSettings
  onClose: () => void
}) {
  return (
    <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-gray-900 text-white text-center px-10 py-12">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="text-4xl mb-4">📣</div>
      <h2 className="text-2xl font-black uppercase tracking-tight mb-3">
        {settings.heading || "Announcement"}
      </h2>
      <p className="text-gray-300 text-sm leading-relaxed mb-7">
        {settings.body || "We have exciting news for you."}
      </p>
      {settings.cta_label && settings.cta_url ? (
        <a
          href={settings.cta_url}
          onClick={onClose}
          className="inline-block bg-yellow-400 text-gray-900 font-bold px-7 py-3 rounded-xl text-sm hover:bg-yellow-300 transition-colors"
        >
          {settings.cta_label}
        </a>
      ) : (
        <button
          onClick={onClose}
          className="bg-white text-gray-900 font-bold px-7 py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors"
        >
          {settings.cta_label || "Got it!"}
        </button>
      )}
    </div>
  )
}

// ─── Template: Newsletter ────────────────────────────────────────────────────

function NewsletterTemplate({
  settings,
  onClose,
}: {
  settings: PopupSettings
  onClose: () => void
}) {
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes("@")) { setError("Please enter a valid email."); return }
    setSubmitting(true)
    setError("")
    try {
      await fetch("/api/popup/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, marketing_consent: consent }),
      })
      setDone(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white px-8 py-10 text-center">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {!done ? (
        <>
          <div className="text-3xl mb-3">✉️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {settings.heading || "Stay in the Loop"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {settings.body || "Subscribe to get the latest news and exclusive offers."}
          </p>
          <form onSubmit={submit} className="space-y-3 text-left">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/30"
              required
            />
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-gray-900"
              />
              <span className="text-xs text-gray-500 leading-snug">
                I agree to receive newsletters and promotional content.
              </span>
            </label>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="text-3xl mb-3">🙌</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">You&apos;re subscribed!</h2>
          <p className="text-sm text-gray-500 mb-5">Thanks for joining us.</p>
          <button
            onClick={onClose}
            className="bg-gray-900 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            {settings.cta_label || "Continue Shopping"}
          </button>
        </>
      )}
    </div>
  )
}

// ─── Main PopupWidget ────────────────────────────────────────────────────────

export default function PopupWidget() {
  const pathname = usePathname()
  const [settings, setSettings] = useState<PopupSettings | null>(null)
  const [visible, setVisible] = useState(false)

  const open = useCallback(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    // Don't show on admin pages
    if (pathname?.startsWith("/admin")) return

    fetch("/api/popup/config")
      .then((r) => r.json())
      .then((cfg: PopupSettings) => {
        if (!cfg.enabled) return

        // Page targeting
        if (cfg.pages === "storefront") {
          const isStorefront = /^\/[a-z]{2}(\/|$)/.test(pathname ?? "")
          if (!isStorefront) return
        }

        // Frequency gate
        if (alreadySeen(cfg.frequency)) return

        setSettings(cfg)

        // Timing
        if (cfg.timing === "delay") {
          const t = setTimeout(open, (cfg.timing_value ?? 3) * 1000)
          return () => clearTimeout(t)
        }

        if (cfg.timing === "scroll") {
          const pct = cfg.timing_value ?? 30
          const handler = () => {
            const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            if (scrolled >= pct) {
              open()
              window.removeEventListener("scroll", handler)
            }
          }
          window.addEventListener("scroll", handler, { passive: true })
          return () => window.removeEventListener("scroll", handler)
        }

        if (cfg.timing === "exit") {
          const handler = (e: MouseEvent) => {
            if (e.clientY <= 5) {
              open()
              document.removeEventListener("mouseleave", handler)
            }
          }
          document.addEventListener("mouseleave", handler)
          return () => document.removeEventListener("mouseleave", handler)
        }
      })
      .catch(() => {/* silently ignore */})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function close() {
    setVisible(false)
    if (settings) markSeen(settings.frequency)
  }

  if (!settings || !visible) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      {settings.template === "discount" && (
        <DiscountTemplate settings={settings} onClose={close} />
      )}
      {settings.template === "announcement" && (
        <AnnouncementTemplate settings={settings} onClose={close} />
      )}
      {settings.template === "newsletter" && (
        <NewsletterTemplate settings={settings} onClose={close} />
      )}
    </div>
  )
}
