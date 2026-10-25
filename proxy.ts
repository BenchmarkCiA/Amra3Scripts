import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { STRICT_COUNTRIES } from "@/lib/consent/constants"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Geo-aware consent mode ─────────────────────────────────────────────────
  // Forwarded as *request* headers so server components can read them via headers().
  const country = request.headers.get("x-vercel-ip-country") ?? "US"
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-consent-mode", STRICT_COUNTRIES.has(country) ? "strict" : "notice")
  requestHeaders.set("x-consent-country", country)
  requestHeaders.set("x-gpc", request.headers.get("Sec-GPC") === "1" ? "1" : "0")

  const nextResponse = () => NextResponse.next({ request: { headers: requestHeaders } })
  let response = nextResponse()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Keep forwarded headers in sync with the refreshed cookies
          requestHeaders.set("cookie", request.headers.get("cookie") ?? "")
          response = nextResponse()
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      const login = new URL("/auth/login", request.url)
      login.searchParams.set("next", pathname)
      return NextResponse.redirect(login)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
