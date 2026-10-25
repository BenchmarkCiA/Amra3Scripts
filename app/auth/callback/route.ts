import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeRedirectPath } from "@/lib/utils/safeUrl"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = safeRedirectPath(searchParams.get("next"), "/account")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=callback`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
