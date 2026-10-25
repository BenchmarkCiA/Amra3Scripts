import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkImageUpload } from "@/lib/utils/imageUpload"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const check = checkImageUpload(file)
    if ("error" in check) return NextResponse.json({ error: check.error }, { status: 400 })

    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${check.ext}`

    const admin = createAdminClient()
    const { error } = await admin.storage
      .from("product-images")
      .upload(filename, file, { contentType: check.type, upsert: false })

    if (error) throw error

    const { data: { publicUrl } } = admin.storage
      .from("product-images")
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
