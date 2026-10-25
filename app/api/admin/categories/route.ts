import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/requireAdmin"
import { slugify, slugOrFallback } from "@/lib/utils/slug"

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("categories")
    .select("*")
    .order("position", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    const admin = createAdminClient()
    const slug = slugOrFallback(body.name, "category")
    const { data, error } = await admin
      .from("categories")
      .insert({
        name: body.name.trim(),
        slug: (typeof body.slug === "string" && slugify(body.slug)) || slug,
        description: body.description || null,
        image_url: body.image_url || null,
        position: body.position ?? 0,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create category"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
