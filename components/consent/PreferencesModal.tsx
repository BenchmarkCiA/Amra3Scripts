"use client"

import { useEffect, useState } from "react"
import { X, ShieldCheck, Lock } from "lucide-react"
import { useConsent } from "./ConsentProvider"

interface Props {
  open: boolean
  onClose: () => void
}

export default function PreferencesModal({ open, onClose }: Props) {
  const { categories, gpc, update, reject } = useConsent()
  const [analytics, setAnalytics] = useState(categories.analytics)
  const [marketing, setMarketing] = useState(categories.marketing)

  // Sync when consent changes externally
  useEffect(() => {
    setAnalytics(categories.analytics)
    setMarketing(categories.marketing)
  }, [categories])

  if (!open) return null

  function handleSave() {
    update({ analytics, marketing })
    onClose()
  }

  function handleRejectAll() {
    reject()
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Privacy preferences"
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, padding: "28px 32px",
          maxWidth: 520, width: "calc(100% - 32px)", maxHeight: "90vh",
          overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Privacy Preferences</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {gpc && (
          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <ShieldCheck size={16} style={{ color: "#0369a1", flexShrink: 0, marginTop: 1 }} />
            <span>
              <strong>Global Privacy Control detected.</strong> Your browser has signalled an opt-out of
              sale/sharing. Non-essential data processing has been disabled automatically.
            </span>
          </div>
        )}

        <p style={{ fontSize: 13, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
          Manage which cookies and tracking technologies we use. Your choices are saved for 13 months.
          See our <a href="/cookie-policy" style={{ color: "inherit" }}>Cookie Policy</a> for details.
        </p>

        {/* Categories */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Necessary — always on */}
          <CategoryRow
            icon={<Lock size={16} />}
            title="Strictly Necessary"
            description="Required for the site to function: session, cart, authentication, and payment processing (Stripe). Cannot be disabled."
            enabled
            locked
            onChange={() => {}}
          />

          {/* Analytics */}
          <CategoryRow
            title="Analytics"
            description="Help us understand how visitors use the site (page views, traffic sources). Data is aggregated and not tied to individual identities."
            enabled={gpc ? false : analytics}
            locked={gpc}
            onChange={setAnalytics}
          />

          {/* Marketing */}
          <CategoryRow
            title="Marketing & Advertising"
            description="Enable personalised ads and retargeting. We never share your data with third-party brokers."
            enabled={gpc ? false : marketing}
            locked={gpc}
            onChange={setMarketing}
          />
        </div>

        {/* Policy version + links */}
        <p style={{ fontSize: 11, color: "#999", margin: "20px 0 0" }}>
          Policy version 1.0.0 ·{" "}
          <a href="/privacy-policy" style={{ color: "#999" }}>Privacy Policy</a> ·{" "}
          <a href="/cookie-policy" style={{ color: "#999" }}>Cookie Policy</a>
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
          <button
            onClick={handleSave}
            style={{ flex: 1, background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Save my choices
          </button>
          <button
            onClick={handleRejectAll}
            style={{ flex: 1, background: "transparent", color: "#111", border: "1.5px solid #111", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Reject all
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryRow({
  icon,
  title,
  description,
  enabled,
  locked,
  onChange,
}: {
  icon?: React.ReactNode
  title: string
  description: string
  enabled: boolean
  locked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 14 }}>
          {icon}
          {title}
          {locked && <span style={{ fontSize: 11, color: "#999", fontWeight: 400 }}>(always on)</span>}
        </div>
        <Toggle enabled={enabled} locked={locked} onChange={onChange} />
      </div>
      <p style={{ fontSize: 12, color: "#666", margin: 0, lineHeight: 1.5 }}>{description}</p>
    </div>
  )
}

function Toggle({
  enabled,
  locked,
  onChange,
}: {
  enabled: boolean
  locked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-disabled={locked}
      onClick={() => !locked && onChange(!enabled)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: locked ? "default" : "pointer",
        background: enabled ? (locked ? "#86efac" : "#22c55e") : "#d1d5db",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute", top: 3, left: enabled ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  )
}
