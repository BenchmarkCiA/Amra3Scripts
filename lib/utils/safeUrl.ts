/** Allow only same-site relative paths ("/x", not "//x") or https URLs. */
export function safeHref(url: unknown): string | null {
  if (typeof url !== "string") return null
  const u = url.trim()
  if (u.startsWith("/") && !u.startsWith("//") && !u.startsWith("/\\")) return u
  try {
    const parsed = new URL(u)
    return parsed.protocol === "https:" ? parsed.toString() : null
  } catch {
    return null
  }
}

/** For post-login redirects: same-site relative paths only. */
export function safeRedirectPath(next: unknown, fallback = "/"): string {
  if (typeof next !== "string") return fallback
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback
  return next
}
