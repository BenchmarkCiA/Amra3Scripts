import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isValidCountry } from "@/lib/countries"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { code } = await params
  if (!isValidCountry(code)) {
    return NextResponse.json({ error: "Invalid country" }, { status: 400 })
  }

  try {
    const body = await request.json() as {
      content?: Record<string, string>
      seo?: Record<string, string>
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from("country_settings")
      .update({
        content: body.content ?? {},
        seo: body.seo ?? {},
        updated_at: new Date().toISOString(),
      })
      .eq("country_code", code)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Country settings update error:", err)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}
