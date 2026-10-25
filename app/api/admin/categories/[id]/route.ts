import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/requireAdmin"
import { slugify } from "@/lib/utils/slug"
import { safeHref } from "@/lib/utils/safeUrl"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const body = (await request.json()) as Record<string, unknown>
  // Whitelist editable fields
  const update: Record<string, unknown> = {}
  if (typeof body.name === "string") {
    if (!body.name.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })
    update.name = body.name.trim()
  }
  if (typeof body.slug === "string" && body.slug.trim()) update.slug = slugify(body.slug)
  if ("description" in body) update.description = typeof body.description === "string" && body.description.trim() ? body.description : null
  if ("image_url" in body) {
    const url = typeof body.image_url === "string" ? body.image_url.trim() : ""
    if (url && !safeHref(url)) return NextResponse.json({ error: "Image URL must start with https://" }, { status: 400 })
    update.image_url = url || null
  }
  if ("position" in body) update.position = Number.isFinite(Number(body.position)) ? Number(body.position) : 0
  if ("is_active" in body) update.is_active = !!body.is_active

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("categories")
    .update(update)
    .eq("id", id)
    .select()
    .single()
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Another category already uses this slug" }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
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
  const { error } = await admin.from("categories").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
