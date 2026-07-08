import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === process.env.ADMIN_EMAIL ? user : null
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("coupons")
      .insert({
        code: (body.code as string).toUpperCase().trim(),
        type: body.type,
        value: body.value,
        min_order_amount: body.min_order_amount || null,
        max_uses: body.max_uses || null,
        valid_from: body.valid_from,
        valid_until: body.valid_until,
        product_ids: body.product_ids?.length ? body.product_ids : null,
        category_ids: body.category_ids?.length ? body.category_ids : null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create coupon"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
