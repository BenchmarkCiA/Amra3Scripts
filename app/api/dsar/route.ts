import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const VALID_TYPES = ["access", "delete", "correct", "opt_out"] as const

export async function POST(req: NextRequest) {
  try {
    const { request_type, email, details } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }
    if (!VALID_TYPES.includes(request_type)) {
      return NextResponse.json({ error: "Invalid request type" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("dsar_requests").insert({
      request_type,
      email: email.trim().toLowerCase(),
      details: (details ?? "").slice(0, 2000),
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}
