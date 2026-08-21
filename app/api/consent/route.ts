import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const { region, categories, gpc, policy_version, user_agent } = await req.json()

    if (!region || !categories || policy_version === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Generate a random session ID server-side — never store IP
    const session_id = crypto.randomUUID()

    const supabase = createAdminClient()
    const { error } = await supabase.from("consent_logs").insert({
      session_id,
      region,
      categories,
      gpc: !!gpc,
      policy_version,
      user_agent: (user_agent ?? "").slice(0, 512),
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    // Never surface internal errors for a privacy endpoint
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
