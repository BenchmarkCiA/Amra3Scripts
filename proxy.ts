import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { STRICT_COUNTRIES } from "@/lib/consent/constants"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  // ── Geo-aware consent mode ─────────────────────────────────────────────────
  const country = request.headers.get("x-vercel-ip-country") ?? "US"
  const mode = STRICT_COUNTRIES.has(country) ? "strict" : "notice"
  response.headers.set("x-consent-mode", mode)
  response.headers.set("x-consent-country", country)
  const gpc = request.headers.get("Sec-GPC") === "1" ? "1" : "0"
  response.headers.set("x-gpc", gpc)

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
          response = NextResponse.next({ request })
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
      return NextResponse.redirect(new URL("/auth/login?next=/admin", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
