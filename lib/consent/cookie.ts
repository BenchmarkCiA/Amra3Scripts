import { CONSENT_COOKIE, CONSENT_COOKIE_MAX_AGE, POLICY_VERSION } from "./constants"
import type { ConsentRecord } from "./types"

export function parseConsentCookie(raw: string | undefined): ConsentRecord | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(atob(raw)) as ConsentRecord
    // Version bump always re-prompts
    if (parsed.version !== POLICY_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function serializeConsentCookie(record: ConsentRecord): string {
  return btoa(JSON.stringify(record))
}

export function setConsentCookie(record: ConsentRecord): void {
  const value = serializeConsentCookie(record)
  document.cookie = [
    `${CONSENT_COOKIE}=${value}`,
    `max-age=${CONSENT_COOKIE_MAX_AGE}`,
    "path=/",
    "SameSite=Lax",
    "Secure",
  ].join("; ")
}

export function getConsentCookie(): ConsentRecord | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
  return parseConsentCookie(match?.split("=").slice(1).join("="))
}

export function clearConsentCookie(): void {
  document.cookie = `${CONSENT_COOKIE}=; max-age=0; path=/`
}
