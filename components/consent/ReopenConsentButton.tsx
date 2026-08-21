"use client"

import { useState } from "react"
import { useConsent } from "./ConsentProvider"
import PreferencesModal from "./PreferencesModal"

export function ReopenConsentButton({ label = "Your Privacy Choices" }: { label?: string }) {
  const { reopen } = useConsent()
  const [prefsOpen, setPrefsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setPrefsOpen(true)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", fontSize: "inherit", color: "inherit" }}
      >
        {label}
      </button>
      <PreferencesModal open={prefsOpen} onClose={() => { setPrefsOpen(false); reopen() && undefined }} />
    </>
  )
}
