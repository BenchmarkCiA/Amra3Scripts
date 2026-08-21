"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { POLICY_VERSION } from "@/lib/consent/constants"
import { getConsentCookie, setConsentCookie } from "@/lib/consent/cookie"
import type { ConsentCategories, ConsentContextValue, ConsentMode, ConsentRecord } from "@/lib/consent/types"

const ConsentContext = createContext<ConsentContextValue | null>(null)

const DEFAULT_OPTOUT: ConsentCategories = { necessary: true, analytics: false, marketing: false }
const DEFAULT_OPTIN: ConsentCategories = { necessary: true, analytics: true, marketing: true }

interface Props {
  children: React.ReactNode
  initialMode: ConsentMode
  gpcFromHeader: boolean
}

export function ConsentProvider({ children, initialMode, gpcFromHeader }: Props) {
  const [record, setRecord] = useState<ConsentRecord | null>(null)
  const [gpc, setGpc] = useState(gpcFromHeader)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  const mode: ConsentMode = record?.mode ?? initialMode

  // ── Bootstrap on client ────────────────────────────────────────────────────
  useEffect(() => {
    const cookie = getConsentCookie()

    // Also check client-side GPC (browser API)
    const clientGpc = !!(navigator as { globalPrivacyControl?: boolean }).globalPrivacyControl
    const hasGpc = gpcFromHeader || clientGpc
    if (hasGpc) setGpc(true)

    if (cookie) {
      setRecord(cookie)
      setSaved(true)
      // If GPC was enabled after consent was given, silently downgrade
      if (hasGpc && (cookie.categories.analytics || cookie.categories.marketing)) {
        const updated: ConsentRecord = {
          ...cookie,
          gpc: true,
          categories: DEFAULT_OPTOUT,
        }
        setRecord(updated)
        setConsentCookie(updated)
        writeAudit(updated)
      }
      return
    }

    // No saved consent yet
    if (hasGpc) {
      // GPC = silent opt-out, no banner
      const gpcRecord: ConsentRecord = {
        version: POLICY_VERSION,
        mode: initialMode,
        categories: DEFAULT_OPTOUT,
        gpc: true,
        timestamp: Date.now(),
      }
      setRecord(gpcRecord)
      setSaved(true)
      setConsentCookie(gpcRecord)
      writeAudit(gpcRecord)
      return
    }

    // Show banner
    setBannerVisible(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const save = useCallback((cats: ConsentCategories, currentGpc: boolean) => {
    const r: ConsentRecord = {
      version: POLICY_VERSION,
      mode: initialMode,
      categories: cats,
      gpc: currentGpc,
      timestamp: Date.now(),
    }
    setRecord(r)
    setSaved(true)
    setBannerVisible(false)
    setConsentCookie(r)
    writeAudit(r)
  }, [initialMode])

  const accept = useCallback(() => save(DEFAULT_OPTIN, gpc), [save, gpc])
  const reject = useCallback(() => save(DEFAULT_OPTOUT, gpc), [save, gpc])

  const update = useCallback(
    (cats: Partial<Omit<ConsentCategories, "necessary">>) => {
      const current = record?.categories ?? DEFAULT_OPTOUT
      save({ ...current, ...cats, necessary: true }, gpc)
    },
    [record, save, gpc]
  )

  const reopen = useCallback(() => setBannerVisible(true), [])

  // Effective categories: GPC always overrides to opt-out of analytics/marketing
  const categories: ConsentCategories = useMemo(() => {
    const base = record?.categories ?? (initialMode === "notice" ? DEFAULT_OPTIN : DEFAULT_OPTOUT)
    if (gpc) return DEFAULT_OPTOUT
    return base
  }, [record, gpc, initialMode])

  const value: ConsentContextValue = {
    record,
    mode,
    gpc,
    saved,
    categories,
    bannerVisible,
    accept,
    reject,
    update,
    reopen,
  }

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error("useConsent must be used inside ConsentProvider")
  return ctx
}

// ── Audit write (fire-and-forget) ─────────────────────────────────────────────
async function writeAudit(record: ConsentRecord) {
  try {
    await fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        region: record.mode,
        categories: record.categories,
        gpc: record.gpc,
        policy_version: record.version,
        user_agent: navigator.userAgent.slice(0, 512),
      }),
    })
  } catch {
    // audit write is best-effort, never block UX
  }
}
