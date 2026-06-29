import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isValidCountry } from "@/lib/countries"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const countryCode = formData.get("country_code") as string

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!countryCode || !isValidCountry(countryCode)) {
      return NextResponse.json({ error: "Invalid country code" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()
    const filename = `campaign/${countryCode}-${Date.now()}.${ext}`

    const admin = createAdminClient()
    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(filename, file, { contentType: file.type, upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = admin.storage
      .from("product-images")
      .getPublicUrl(filename)

    const { error: dbError } = await admin
      .from("country_settings")
      .update({ hero_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("country_code", countryCode)

    if (dbError) throw dbError

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error("Campaign upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { countryCode } = (await request.json()) as { countryCode: string }
    if (!countryCode || !isValidCountry(countryCode)) {
      return NextResponse.json({ error: "Invalid country code" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin
      .from("country_settings")
      .update({ hero_image_url: null, updated_at: new Date().toISOString() })
      .eq("country_code", countryCode)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Campaign delete error:", err)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
