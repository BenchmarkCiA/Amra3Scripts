import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/requireAdmin"
import { sanitizeCouponInput } from "@/lib/coupons/input"

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
    const parsed = sanitizeCouponInput(await request.json())
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from("coupons").insert(parsed.data).select().single()
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "A coupon with this code already exists" }, { status: 409 })
      throw error
    }
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error("Create coupon error:", err)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
