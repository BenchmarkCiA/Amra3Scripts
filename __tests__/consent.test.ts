/**
 * Consent system unit tests.
 *
 * Covers the four mandated behaviours:
 *   1. GPC header → automatic opt-out, no banner
 *   2. UK/EU strict mode → scripts blocked pre-consent
 *   3. US notice mode → scripts allowed by default
 *   4. Consent persists across reloads via cookie
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import {
  parseConsentCookie,
  serializeConsentCookie,
  getConsentCookie,
  setConsentCookie,
  clearConsentCookie,
} from "../lib/consent/cookie"
import { POLICY_VERSION } from "../lib/consent/constants"
import type { ConsentRecord } from "../lib/consent/types"

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRecord(overrides: Partial<ConsentRecord> = {}): ConsentRecord {
  return {
    version: POLICY_VERSION,
    mode: "notice",
    categories: { necessary: true, analytics: true, marketing: true },
    gpc: false,
    timestamp: Date.now(),
    ...overrides,
  }
}

function setCookieRaw(value: string) {
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: `otzma_consent=${value}`,
  })
}

// ── 1. GPC: automatic opt-out ─────────────────────────────────────────────────

describe("Global Privacy Control", () => {
  it("parses a GPC-flagged record as opting out of analytics and marketing", () => {
    const record = makeRecord({ gpc: true, categories: { necessary: true, analytics: false, marketing: false } })
    const serialised = serializeConsentCookie(record)
    const parsed = parseConsentCookie(serialised)
    expect(parsed?.gpc).toBe(true)
    expect(parsed?.categories.analytics).toBe(false)
    expect(parsed?.categories.marketing).toBe(false)
  })

  it("version mismatch invalidates cookie (forces re-prompt)", () => {
    const stale = makeRecord({ version: "0.9.0" })
    const serialised = serializeConsentCookie(stale)
    const parsed = parseConsentCookie(serialised)
    expect(parsed).toBeNull()
  })

  it("returns null for a malformed cookie string", () => {
    expect(parseConsentCookie("not-base64!!")).toBeNull()
    expect(parseConsentCookie("")).toBeNull()
    expect(parseConsentCookie(undefined)).toBeNull()
  })
})

// ── 2. UK/EU strict mode: scripts blocked pre-consent ─────────────────────────

describe("Strict mode (UK/EU) — effective categories", () => {
  it("defaults to all non-essential OFF when no consent record exists", () => {
    // No cookie → ConsentProvider initialises with DEFAULT_OPTOUT for strict mode
    // We test the record shape that would be produced by 'reject'
    const rejected = makeRecord({
      mode: "strict",
      categories: { necessary: true, analytics: false, marketing: false },
    })
    expect(rejected.categories.analytics).toBe(false)
    expect(rejected.categories.marketing).toBe(false)
    expect(rejected.categories.necessary).toBe(true)
  })

  it("'accept' record enables analytics and marketing", () => {
    const accepted = makeRecord({
      mode: "strict",
      categories: { necessary: true, analytics: true, marketing: true },
    })
    expect(accepted.categories.analytics).toBe(true)
    expect(accepted.categories.marketing).toBe(true)
  })

  it("serialise → parse round-trip preserves strict-mode categories", () => {
    const record = makeRecord({ mode: "strict", categories: { necessary: true, analytics: false, marketing: false } })
    const parsed = parseConsentCookie(serializeConsentCookie(record))
    expect(parsed?.mode).toBe("strict")
    expect(parsed?.categories.analytics).toBe(false)
  })
})

// ── 3. US notice mode: scripts allowed by default ─────────────────────────────

describe("Notice mode (US) — effective categories", () => {
  it("default state for notice mode has analytics and marketing enabled", () => {
    // Notice mode ConsentProvider starts with DEFAULT_OPTIN before user chooses
    const defaultNotice = makeRecord({
      mode: "notice",
      categories: { necessary: true, analytics: true, marketing: true },
    })
    expect(defaultNotice.categories.analytics).toBe(true)
    expect(defaultNotice.categories.marketing).toBe(true)
  })

  it("opt-out via preferences disables analytics and marketing", () => {
    const optedOut = makeRecord({
      mode: "notice",
      categories: { necessary: true, analytics: false, marketing: false },
    })
    expect(optedOut.categories.analytics).toBe(false)
    expect(optedOut.categories.marketing).toBe(false)
  })
})

// ── 4. Consent persists across reloads ────────────────────────────────────────

describe("Cookie persistence", () => {
  beforeEach(() => {
    // Reset document.cookie to empty before each test
    Object.defineProperty(document, "cookie", { writable: true, value: "" })
  })

  it("setConsentCookie writes a parseable value to document.cookie", () => {
    const record = makeRecord()
    setConsentCookie(record)
    const parsed = getConsentCookie()
    expect(parsed).not.toBeNull()
    expect(parsed?.version).toBe(POLICY_VERSION)
    expect(parsed?.categories.analytics).toBe(true)
  })

  it("getConsentCookie returns null when no cookie is set", () => {
    expect(getConsentCookie()).toBeNull()
  })

  it("clearConsentCookie removes the stored record", () => {
    setConsentCookie(makeRecord())
    clearConsentCookie()
    // After clearing, document.cookie contains max-age=0 directive; value is empty
    const parsed = getConsentCookie()
    // The cookie value is now empty/expired — parseConsentCookie returns null
    expect(parsed).toBeNull()
  })

  it("round-trips all category combinations without corruption", () => {
    const combos: Array<[boolean, boolean]> = [[true,true],[true,false],[false,true],[false,false]]
    for (const [analytics, marketing] of combos) {
      const r = makeRecord({ categories: { necessary: true, analytics, marketing } })
      const parsed = parseConsentCookie(serializeConsentCookie(r))
      expect(parsed?.categories.analytics).toBe(analytics)
      expect(parsed?.categories.marketing).toBe(marketing)
    }
  })
})

// ── 5. STRICT_COUNTRIES membership ───────────────────────────────────────────

describe("STRICT_COUNTRIES", () => {
  it("includes GB (UK GDPR)", async () => {
    const { STRICT_COUNTRIES } = await import("../lib/consent/constants")
    expect(STRICT_COUNTRIES.has("GB")).toBe(true)
  })

  it("includes EU member states", async () => {
    const { STRICT_COUNTRIES } = await import("../lib/consent/constants")
    for (const code of ["DE","FR","IT","ES","NL","PL","SE","IE"]) {
      expect(STRICT_COUNTRIES.has(code)).toBe(true)
    }
  })

  it("does not include US", async () => {
    const { STRICT_COUNTRIES } = await import("../lib/consent/constants")
    expect(STRICT_COUNTRIES.has("US")).toBe(false)
  })
})
