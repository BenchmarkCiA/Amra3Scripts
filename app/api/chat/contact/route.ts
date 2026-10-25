import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json()

  if (typeof email !== "string" || typeof message !== "string" || !email.trim() || !message.trim()) {
    return NextResponse.json({ error: "Email and message are required" }, { status: 400 })
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
  }
  if (message.length > 5000 || (typeof name === "string" && name.length > 200)) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 })
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

  const { error } = await admin.from("contact_messages").insert({
    name: typeof name === "string" && name.trim() ? name.trim() : null,
    // Signed-in customers can't send on behalf of another address
    email: user?.email ?? email.trim(),
    message: message.trim(),
    customer_id: customerId,
  })
  if (error) {
    console.error("Contact message insert failed:", error)
    return NextResponse.json({ error: "Could not send message" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
