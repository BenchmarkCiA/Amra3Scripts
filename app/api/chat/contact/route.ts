import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json()

  if (!email || !message) {
    return NextResponse.json({ error: "Email and message are required" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  let customerId: string | null = null
  if (user) {
    const { data: customer } = await admin
      .from("customers")
      .select("id")
      .eq("id", user.id)
      .single()
    customerId = customer?.id ?? null
  }

  await admin.from("contact_messages").insert({
    name: name || null,
    email,
    message,
    customer_id: customerId,
  })

  return NextResponse.json({ success: true })
}
