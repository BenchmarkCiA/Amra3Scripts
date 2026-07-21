"use client"

import { useState } from "react"
import type { Country } from "@/lib/countries"

interface ContentOverrides {
  announcement?: string
  heroH1a?: string
  heroH1b?: string
  heroLead?: string
  heroCta1?: string
  heroCta2?: string
  collectionTitle?: string
  stat1Label?: string
  stat1Sub?: string
  stat2Label?: string
  stat2Sub?: string
  stat3Label?: string
  stat3Sub?: string
  customizerH2a?: string
  customizerH2b?: string
  customizerLead?: string
  customizerLabel?: string
  footerBadge?: string
}

interface SeoOverrides {
  metaTitle?: string
  metaDescription?: string
}

interface Props {
  country: Country
  initialContent: ContentOverrides
  initialSeo: SeoOverrides
  defaults: ContentOverrides & {
    defaultMetaTitle: string
    defaultMetaDescription: string
    stat1Label: string; stat1Sub: string
    stat2Label: string; stat2Sub: string
    stat3Label: string; stat3Sub: string
    customizerH2a: string; customizerH2b: string
    customizerLead: string; customizerLabel: string
    footerBadge: string
  }
}

function Field({
  label,
  hint,
  value,
  placeholder,
  onChange,
  maxLength,
  multiline,
}: {
  label: string
  hint?: string
  value: string
  placeholder: string
  onChange: (v: string) => void
  maxLength?: number
  multiline?: boolean
}) {
  const remaining = maxLength ? maxLength - value.length : null
  const isNearLimit = remaining !== null && remaining < 20

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {remaining !== null && (
          <span className={`text-xs tabular-nums ${isNearLimit ? "text-warning" : "text-muted-foreground"}`}>
            {remaining} left
          </span>
        )}
      </div>
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
          type="text"
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

export default function CountryContentForm({ country, initialContent, initialSeo, defaults }: Props) {
  const [content, setContent] = useState<ContentOverrides>(initialContent)
  const [seo, setSeo] = useState<SeoOverrides>(initialSeo)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")

  function setC(key: keyof ContentOverrides, val: string) {
    setContent((prev) => ({ ...prev, [key]: val }))
    setStatus("idle")
  }

  function setS(key: keyof SeoOverrides, val: string) {
    setSeo((prev) => ({ ...prev, [key]: val }))
    setStatus("idle")
  }

  async function save() {
    setSaving(true)
    setStatus("idle")
    try {
      // Strip empty strings so defaults are used for blank fields
      const cleanContent = Object.fromEntries(
        Object.entries(content).filter(([, v]) => v && v.trim())
      ) as ContentOverrides
      const cleanSeo = Object.fromEntries(
        Object.entries(seo).filter(([, v]) => v && v.trim())
      ) as SeoOverrides

      const res = await fetch(`/api/country-settings/${country.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: cleanContent, seo: cleanSeo }),
      })
      if (!res.ok) throw new Error()
      setStatus("saved")
    } catch {
      setStatus("error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Text */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5">
          Page Text
        </h2>
        <div className="space-y-5">
          <Field
            label="Announcement bar"
            hint="Thin strip at the very top of the page"
            value={content.announcement ?? ""}
            placeholder={defaults.announcement ?? ""}
            onChange={(v) => setC("announcement", v)}
            maxLength={120}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Hero headline — line 1"
              value={content.heroH1a ?? ""}
              placeholder={defaults.heroH1a ?? ""}
              onChange={(v) => setC("heroH1a", v)}
              maxLength={50}
            />
            <Field
              label="Hero headline — line 2"
              value={content.heroH1b ?? ""}
              placeholder={defaults.heroH1b ?? ""}
              onChange={(v) => setC("heroH1b", v)}
              maxLength={50}
            />
          </div>
          <Field
            label="Hero subtitle"
            value={content.heroLead ?? ""}
            placeholder={defaults.heroLead ?? ""}
            onChange={(v) => setC("heroLead", v)}
            maxLength={220}
            multiline
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Primary button"
              value={content.heroCta1 ?? ""}
              placeholder={defaults.heroCta1 ?? ""}
              onChange={(v) => setC("heroCta1", v)}
              maxLength={40}
            />
            <Field
              label="Secondary button"
              value={content.heroCta2 ?? ""}
              placeholder={defaults.heroCta2 ?? ""}
              onChange={(v) => setC("heroCta2", v)}
              maxLength={40}
            />
          </div>
          <Field
            label="Collection section heading"
            value={content.collectionTitle ?? ""}
            placeholder={defaults.collectionTitle ?? ""}
            onChange={(v) => setC("collectionTitle", v)}
            maxLength={80}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Stats Bar
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          The three numbers shown below the hero image.
        </p>
        <div className="space-y-4">
          {([
            { labelKey: "stat1Label" as const, subKey: "stat1Sub" as const, num: 1, defaultLabel: defaults.stat1Label, defaultSub: defaults.stat1Sub },
            { labelKey: "stat2Label" as const, subKey: "stat2Sub" as const, num: 2, defaultLabel: defaults.stat2Label, defaultSub: defaults.stat2Sub },
            { labelKey: "stat3Label" as const, subKey: "stat3Sub" as const, num: 3, defaultLabel: defaults.stat3Label, defaultSub: defaults.stat3Sub },
          ]).map(({ labelKey, subKey, num, defaultLabel, defaultSub }) => (
            <div key={num} className="grid grid-cols-2 gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <Field
                label={`Stat ${num} — number / value`}
                value={content[labelKey] ?? ""}
                placeholder={defaultLabel}
                onChange={(v) => setC(labelKey, v)}
                maxLength={20}
              />
              <Field
                label={`Stat ${num} — label`}
                value={content[subKey] ?? ""}
                placeholder={defaultSub}
                onChange={(v) => setC(subKey, v)}
                maxLength={40}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Customizer section */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          "Make It Yours" Section
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          The personalisation section below the product grid.
        </p>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Heading — line 1"
              value={content.customizerH2a ?? ""}
              placeholder={defaults.customizerH2a}
              onChange={(v) => setC("customizerH2a", v)}
              maxLength={50}
            />
            <Field
              label="Heading — line 2"
              value={content.customizerH2b ?? ""}
              placeholder={defaults.customizerH2b}
              onChange={(v) => setC("customizerH2b", v)}
              maxLength={50}
            />
          </div>
          <Field
            label="Description"
            value={content.customizerLead ?? ""}
            placeholder={defaults.customizerLead}
            onChange={(v) => setC("customizerLead", v)}
            maxLength={300}
            multiline
          />
          <Field
            label="Input field label"
            hint="The label above the text input box"
            value={content.customizerLabel ?? ""}
            placeholder={defaults.customizerLabel}
            onChange={(v) => setC("customizerLabel", v)}
            maxLength={40}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Footer
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          Text displayed in the dark footer at the bottom of the page.
        </p>
        <Field
          label="Brand badge / tagline"
          hint="Small pill shown under the logo in the footer"
          value={content.footerBadge ?? ""}
          placeholder={defaults.footerBadge}
          onChange={(v) => setC("footerBadge", v)}
          maxLength={60}
        />
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          SEO
        </h2>
        <p className="text-xs text-muted-foreground mb-5">
          Controls what appears in Google results and browser tabs. Leave blank to use the default.
        </p>
        <div className="space-y-5">
          <Field
            label="Page title"
            hint="Shown in browser tab and Google. Aim for 50–60 characters."
            value={seo.metaTitle ?? ""}
            placeholder={defaults.defaultMetaTitle}
            onChange={(v) => setS("metaTitle", v)}
            maxLength={70}
          />
          <Field
            label="Meta description"
            hint="Shown under the page title in Google results. Aim for 140–160 characters."
            value={seo.metaDescription ?? ""}
            placeholder={defaults.defaultMetaDescription}
            onChange={(v) => setS("metaDescription", v)}
            maxLength={170}
            multiline
          />
        </div>
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
        <span className="text-xs text-muted-foreground ml-auto">
          Blank fields fall back to the default text shown as placeholder
        </span>
      </div>
    </div>
  )
}
