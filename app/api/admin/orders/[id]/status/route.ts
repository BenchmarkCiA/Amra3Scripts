import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null
  return user
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { customer_status } = await request.json()

  const validStatuses = ["in_preparation", "in_delivery", "waiting_for_pickup", "picked_up", null]
  if (!validStatuses.includes(customer_status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("orders")
    .update({ customer_status })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
