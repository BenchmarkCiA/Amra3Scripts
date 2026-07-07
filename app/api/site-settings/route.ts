import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const admin = createAdminClient()
    const { data } = await admin.from("site_settings").select("key, value")
    const settings = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({})
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { key, value } = await request.json() as { key: string; value: Record<string, string> }
    const admin = createAdminClient()
    const { error } = await admin.from("site_settings").upsert({ key, value })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Site settings update error:", err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
