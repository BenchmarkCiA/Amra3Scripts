"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { useConsent } from "./ConsentProvider"
import PreferencesModal from "./PreferencesModal"

export default function ConsentBanner() {
  const { bannerVisible, mode, accept, reject, gpc } = useConsent()
  const [prefsOpen, setPrefsOpen] = useState(false)

  if (!bannerVisible || gpc) return null

  return (
    <>
      {mode === "strict" ? (
        <StrictBanner onPrefs={() => setPrefsOpen(true)} onAccept={accept} onReject={reject} />
      ) : (
        <NoticeBanner onPrefs={() => setPrefsOpen(true)} onDismiss={accept} />
      )}
      <PreferencesModal open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </>
  )
}

// ── UK/EU: must opt-in ────────────────────────────────────────────────────────
function StrictBanner({
  onPrefs,
  onAccept,
  onReject,
}: {
  onPrefs: () => void
  onAccept: () => void
  onReject: () => void
}) {
  const bannerRef = useRef<HTMLDivElement>(null)

  // Move focus into banner on mount
  useEffect(() => {
    const first = bannerRef.current?.querySelector<HTMLElement>("button, a[href]")
    first?.focus()
  }, [])

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-labelledby="consent-banner-title"
      aria-modal="true"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#fff",
        borderTop: "1px solid rgba(0,0,0,0.1)",
        padding: "20px 24px",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p id="consent-banner-title" style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
          We use cookies and similar technologies to operate this site and, with your consent, to
          analyse traffic and personalise ads.{" "}
          <a href="/cookie-policy" style={{ color: "inherit", textDecoration: "underline" }}>
            Cookie Policy
          </a>
          . You can accept all, reject non-essential, or manage your preferences.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {/* Accept and Reject have identical visual weight — no dark pattern */}
          <button onClick={onAccept} style={btnStyle("#111")}>
            Accept all
          </button>
          <button onClick={onReject} style={btnStyle("#111")}>
            Reject all
          </button>
          <button
            onClick={onPrefs}
            style={{ ...btnStyle("transparent"), border: "1.5px solid #111", color: "#111" }}
          >
            Manage preferences
          </button>
        </div>
      </div>
    </div>
  )
}

// ── US: notice-at-collection ──────────────────────────────────────────────────
function NoticeBanner({
  onPrefs,
  onDismiss,
}: {
  onPrefs: () => void
  onDismiss: () => void
}) {
  return (
    <div
      role="region"
      aria-label="Privacy notice"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 520,
        zIndex: 9999,
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 12,
        padding: "16px 20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <p style={{ fontSize: 13, lineHeight: 1.5, marginRight: 12 }}>
          We collect personal information as described in our{" "}
          <a href="/privacy-policy" style={{ color: "inherit", textDecoration: "underline" }}>
            Privacy Policy
          </a>
          .{" "}
          <button
            onClick={onPrefs}
            style={{ background: "none", border: "none", padding: 0, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}
          >
            Your Privacy Choices
          </button>
        </p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss privacy notice"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: bg === "transparent" ? "#111" : "#fff",
    border: "1.5px solid transparent",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    minHeight: 44,
  }
}
