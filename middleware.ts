import { NextRequest, NextResponse } from "next/server"
import { STRICT_COUNTRIES } from "@/lib/consent/constants"

export function middleware(req: NextRequest): NextResponse {
  const res = NextResponse.next()

  // ── Geo detection ──────────────────────────────────────────────────────────
  // Vercel sets x-vercel-ip-country on edge; fall back to US in dev/local.
  const country = req.headers.get("x-vercel-ip-country") ?? "US"
  const mode = STRICT_COUNTRIES.has(country) ? "strict" : "notice"
  res.headers.set("x-consent-mode", mode)
  res.headers.set("x-consent-country", country)

  // ── Global Privacy Control (server-side signal) ────────────────────────────
  // Sec-GPC: 1 means the browser has signalled an opt-out.
  const gpc = req.headers.get("Sec-GPC") === "1" ? "1" : "0"
  res.headers.set("x-gpc", gpc)

  return res
}

export const config = {
  // Run on all routes except static assets, images, and API internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
