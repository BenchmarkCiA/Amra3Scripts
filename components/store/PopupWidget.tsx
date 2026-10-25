"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { safeHref } from "@/lib/utils/safeUrl"
import { useConsent } from "@/components/consent/ConsentProvider"

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
    // "session" is tracked only in sessionStorage — check it before localStorage
    if (frequency === "session") {
      return !!sessionStorage.getItem(STORAGE_KEY)
    }
    if (frequency === "day") {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return false
      return Date.now() - parseInt(raw, 10) < 86_400_000
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
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
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
      {settings.cta_label && safeHref(settings.cta_url) ? (
        <a
          href={safeHref(settings.cta_url) ?? undefined}
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
      const res = await fetch("/api/popup/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, marketing_consent: consent }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
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

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea,select,[tabindex]:not([tabindex="-1"])'

export default function PopupWidget() {
  const pathname = usePathname()
  const { bannerVisible } = useConsent()
  const [config, setConfig] = useState<PopupSettings | null>(null)
  const [visible, setVisible] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  // Fetch config once per page load, not on every navigation
  useEffect(() => {
    let cancelled = false
    fetch("/api/popup/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg: PopupSettings | null) => { if (!cancelled && cfg?.enabled) setConfig(cfg) })
      .catch(() => {/* popup is optional */})
    return () => { cancelled = true }
  }, [])

  const eligible =
    !!config &&
    !pathname?.startsWith("/admin") &&
    !pathname?.startsWith("/checkout") &&
    (config.pages !== "storefront" || /^\/[a-z]{2}(\/|$)/.test(pathname ?? ""))

  // Arm the trigger; every timer/listener is cleaned up on navigation or unmount
  useEffect(() => {
    // Don't stack on top of the cookie banner
    if (!config || !eligible || visible || bannerVisible || alreadySeen(config.frequency)) return
    const show = () => {
      returnFocusRef.current = document.activeElement as HTMLElement | null
      setVisible(true)
    }

    if (config.timing === "scroll") {
      const pct = config.timing_value ?? 30
      const handler = () => {
        const max = document.body.scrollHeight - window.innerHeight
        if (max > 0 && (window.scrollY / max) * 100 >= pct) show()
      }
      window.addEventListener("scroll", handler, { passive: true })
      return () => window.removeEventListener("scroll", handler)
    }

    if (config.timing === "exit") {
      const handler = (e: MouseEvent) => { if (e.clientY <= 5) show() }
      document.addEventListener("mouseleave", handler)
      return () => document.removeEventListener("mouseleave", handler)
    }

    const t = setTimeout(show, (config.timing_value ?? 3) * 1000)
    return () => clearTimeout(t)
  }, [config, eligible, visible, bannerVisible, pathname])

  const close = useCallback(() => {
    setVisible(false)
    if (config) markSeen(config.frequency)
    returnFocusRef.current?.focus?.()
  }, [config])

  // Focus trap + Escape while open
  useEffect(() => {
    if (!visible) return
    const el = dialogRef.current
    el?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return }
      if (e.key !== "Tab" || !el) return
      const nodes = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [visible, close])

  if (!config || !visible || !eligible) return null
  const settings = config

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={settings.heading || "Special offer"}
        className="w-full flex justify-center"
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
    </div>
  )
}
