import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null
  return user
}

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

  if (body.type === "settings") {
    await admin
      .from("site_settings")
      .upsert({ key: "chat_settings", value: body.value }, { onConflict: "key" })
  } else if (body.type === "faqs") {
    await admin
      .from("site_settings")
      .upsert({ key: "chat_faqs", value: body.value }, { onConflict: "key" })
  } else if (body.type === "mark_read") {
    await admin
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", body.id)
  }

  return NextResponse.json({ success: true })
}
