"use client"

import { useState } from "react"
import { Eye } from "lucide-react"

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

const TEMPLATES = [
  {
    id: "discount" as const,
    name: "Discount Offer",
    desc: "Email capture with a percentage discount code reveal",
    emoji: "🏷️",
  },
  {
    id: "announcement" as const,
    name: "Announcement",
    desc: "Simple message with an optional call-to-action button",
    emoji: "📣",
  },
  {
    id: "newsletter" as const,
    name: "Newsletter",
    desc: "Clean email subscribe form for marketing list building",
    emoji: "✉️",
  },
]

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-sm font-medium">{label}</span>
    </label>
  )
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
  multiline,
  type,
}: {
  label: string
  hint?: string
  value: string | number
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
  multiline?: boolean
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      ) : (
        <input
          type={type ?? "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}
    </div>
  )
}

export default function PopupAdminPanel({ initial }: { initial: PopupSettings }) {
  const [s, setS] = useState<PopupSettings>(initial)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")

  function upd<K extends keyof PopupSettings>(key: K, val: PopupSettings[K]) {
    setS((prev) => ({ ...prev, [key]: val }))
    setStatus("idle")
  }

  async function save() {
    setSaving(true)
    setStatus("idle")
    try {
      const res = await fetch("/api/admin/popup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      })
      if (!res.ok) throw new Error()
      setStatus("saved")
    } catch {
      setStatus("error")
    } finally {
      setSaving(false)
    }
  }

  const showCoupon = s.template === "discount"
  const showCta = s.template === "announcement" || s.template === "newsletter"

  return (
    <div className="max-w-2xl space-y-8">

      {/* Enable / disable */}
      <div className="bg-white rounded-xl border border-border p-6 flex items-center justify-between">
        <div>
          <p className="font-semibold">Popup enabled</p>
          <p className="text-xs text-muted-foreground mt-0.5">When disabled, nothing is shown to visitors</p>
        </div>
        <Toggle label="" value={s.enabled} onChange={(v) => upd("enabled", v)} />
      </div>

      {/* Template picker */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Template
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => upd("template", t.id)}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${
                s.template === t.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="text-2xl mb-2">{t.emoji}</div>
              <div className="text-sm font-semibold mb-1">{t.name}</div>
              <div className="text-xs text-muted-foreground leading-snug">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Content
        </h2>
        <Field
          label="Heading"
          value={s.heading}
          onChange={(v) => upd("heading", v)}
          placeholder="Get 10% Off Your First Order"
          maxLength={80}
        />
        <Field
          label="Body text"
          value={s.body}
          onChange={(v) => upd("body", v)}
          placeholder="Enter your email and receive an exclusive discount."
          maxLength={300}
          multiline
        />
        {showCoupon && (
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Discount %"
              hint="Shown prominently in the left panel"
              value={s.discount_percent}
              onChange={(v) => upd("discount_percent", parseInt(v) || 0)}
              type="number"
            />
            <Field
              label="Coupon code"
              hint="Revealed after email + consent"
              value={s.coupon_code}
              onChange={(v) => upd("coupon_code", v.toUpperCase())}
              placeholder="WELCOME10"
              maxLength={30}
            />
          </div>
        )}
        {showCta && (
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Button label"
              value={s.cta_label}
              onChange={(v) => upd("cta_label", v)}
              placeholder="Shop Now"
              maxLength={40}
            />
            <Field
              label="Button URL"
              hint="Leave blank to just close the popup"
              value={s.cta_url}
              onChange={(v) => upd("cta_url", v)}
              placeholder="/il"
              maxLength={200}
            />
          </div>
        )}
      </div>

      {/* Display settings */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          When &amp; Where to Show
        </h2>

        {/* Timing */}
        <div>
          <label className="block text-sm font-medium mb-2">Timing</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "delay", label: "After a delay" },
                { id: "scroll", label: "After scrolling" },
                { id: "exit", label: "Exit intent" },
              ] as { id: PopupSettings["timing"]; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => upd("timing", opt.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  s.timing === opt.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {s.timing !== "exit" && (
            <div className="mt-3">
              <Field
                label={s.timing === "delay" ? "Delay (seconds)" : "Scroll depth (%)"}
                value={s.timing_value}
                onChange={(v) => upd("timing_value", parseFloat(v) || 0)}
                type="number"
                placeholder={s.timing === "delay" ? "3" : "30"}
              />
            </div>
          )}
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium mb-2">Show frequency</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "session", label: "Once per session" },
                { id: "day", label: "Once per day" },
                { id: "always", label: "Every visit" },
              ] as { id: PopupSettings["frequency"]; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => upd("frequency", opt.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  s.frequency === opt.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pages */}
        <div>
          <label className="block text-sm font-medium mb-2">Show on</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "all", label: "All pages" },
                { id: "storefront", label: "Country storefronts only" },
              ] as { id: PopupSettings["pages"]; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => upd("pages", opt.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  s.pages === opt.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview hint */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
        <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>
          To preview the popup on the storefront, enable it, save, then visit any store page.
          Set frequency to &ldquo;Every visit&rdquo; while testing so it always shows.
        </span>
      </div>

      {/* Save bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && (
          <span className="text-sm text-success font-medium">Saved!</span>
        )}
        {status === "error" && (
          <span className="text-sm text-destructive font-medium">Save failed — try again</span>
        )}
      </div>
    </div>
  )
}
