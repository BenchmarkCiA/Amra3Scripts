export const POLICY_VERSION = "1.0.0"
export const CONSENT_COOKIE = "otzma_consent"
// 13 months in seconds
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 394

// Countries that require prior opt-in (UK GDPR + EU GDPR + EEA)
export const STRICT_COUNTRIES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI",
  "FR","GR","HR","HU","IE","IT","LT","LU","LV","MT",
  "NL","PL","PT","RO","SE","SI","SK",
  "GB", // UK GDPR
  "NO","IS","LI", // EEA non-EU
])
