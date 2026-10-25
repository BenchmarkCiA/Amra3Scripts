import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/requireAdmin"

// GET: fetch messages + settings + faqs
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()
  const [{ data: messages }, { data: settings }, { data: faqs }] = await Promise.all([
    admin.from("contact_messages").select("*").order("created_at", { ascending: false }),
    admin.from("site_settings").select("value").eq("key", "chat_settings").single(),
    admin.from("site_settings").select("value").eq("key", "chat_faqs").single(),
  ])

  return NextResponse.json({
    messages: messages ?? [],
    settings: settings?.value ?? {},
    faqs: faqs?.value ?? [],
  })
}

// PATCH: update settings or faqs
export async function PATCH(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  let error: { message: string } | null = null
  if (body.type === "settings") {
    ;({ error } = await admin
      .from("site_settings")
      .upsert({ key: "chat_settings", value: body.value }, { onConflict: "key" }))
  } else if (body.type === "faqs") {
    if (!Array.isArray(body.value)) {
      return NextResponse.json({ error: "FAQs must be a list" }, { status: 400 })
    }
    ;({ error } = await admin
      .from("site_settings")
      .upsert({ key: "chat_faqs", value: body.value }, { onConflict: "key" }))
  } else if (body.type === "mark_read") {
    ;({ error } = await admin
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", body.id))
  } else {
    return NextResponse.json({ error: "Unknown update type" }, { status: 400 })
  }

  if (error) {
    console.error("Admin chat update failed:", error)
    return NextResponse.json({ error: "Save failed" }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
