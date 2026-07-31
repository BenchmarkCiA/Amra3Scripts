import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

type Params = { params: Promise<{ id: string; reviewId: string }> }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null
  return user
}

// Admin: update a review
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { reviewId } = await params
  const { reviewer_name, rating, body } = await req.json()

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("product_reviews")
    .update({ reviewer_name, rating: parseInt(rating), body: body || null })
    .eq("id", reviewId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Admin: delete a review
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { reviewId } = await params

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
