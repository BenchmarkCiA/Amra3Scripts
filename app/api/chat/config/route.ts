import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = createAdminClient()
  const [{ data: settings }, { data: faqs }] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "chat_settings").single(),
    supabase.from("site_settings").select("value").eq("key", "chat_faqs").single(),
  ])

  return NextResponse.json({
    settings: settings?.value ?? { enabled: false, position: "bottom-right", greeting: "Hi there! How can I help you?" },
    faqs: faqs?.value ?? [],
  }, {
    headers: { "Cache-Control": "no-store" },
  })
}
