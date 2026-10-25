import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/requireAdmin"
import { sanitizeCouponInput } from "@/lib/coupons/input"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  // Whitelisted fields only — uses_count, id etc. can't be overwritten
  const parsed = sanitizeCouponInput(await request.json(), true)
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("coupons")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const admin = createAdminClient()
  const { error } = await admin.from("coupons").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
