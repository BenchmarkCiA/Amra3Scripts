import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ orders: [] }, { status: 401 })

  const admin = createAdminClient()
  const { data: orders } = await admin
    .from("orders")
    .select("id, order_number, customer_status, total, currency, created_at, order_items(title, quantity, image_url)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return NextResponse.json({ orders: orders ?? [] })
}
