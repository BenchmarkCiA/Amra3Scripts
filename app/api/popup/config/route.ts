import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "popup_settings")
    .single()

  return NextResponse.json(
    data?.value ?? { enabled: false },
    { headers: { "Cache-Control": "no-store" } }
  )
}
