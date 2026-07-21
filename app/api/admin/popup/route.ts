import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "popup_settings")
    .single()

  return NextResponse.json(data?.value ?? { enabled: false })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "popup_settings")
    .single()

  const merged = { ...(existing?.value ?? {}), ...body }

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "popup_settings", value: merged }, { onConflict: "key" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, settings: merged })
}
