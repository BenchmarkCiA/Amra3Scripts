import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/auth/requireAdmin"
import { slugify } from "@/lib/utils/slug"
import { normalizeVariants } from "@/lib/products/variants"

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const body = await request.json()
    const { title, description, category_id, tags, status, is_featured, images, seo_title, seo_description, country_codes, allow_personalization, limited_time_label } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (status && !["draft", "active", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    // Validate everything before writing anything, so a bad variant can't leave a half-saved product
    const parsed = normalizeVariants(body.variants)
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const admin = createAdminClient()

    const { data: existingVariants, error: existingError } = await admin
      .from("product_variants")
      .select("id")
      .eq("product_id", id)
    if (existingError) throw existingError
    const existingIds = new Set((existingVariants ?? []).map((v) => v.id))
    if (parsed.variants.some((v) => v.id && !existingIds.has(v.id))) {
      return NextResponse.json({ error: "Variant does not belong to this product" }, { status: 400 })
    }

    // Slug stays stable (URLs/SEO); it only changes when explicitly provided
    const slugUpdate = typeof body.slug === "string" && body.slug.trim() ? { slug: slugify(body.slug) } : {}

    const { data: product, error } = await admin
      .from("products")
      .update({
        title: title.trim(),
        description: description || null,
        ...slugUpdate,
        category_id: category_id || null,
        tags: tags || [],
        status: status || "draft",
        is_featured: is_featured || false,
        images: images || [],
        seo_title: seo_title || null,
        seo_description: seo_description || null,
        country_codes: country_codes?.length ? country_codes : null,
        allow_personalization: allow_personalization === true,
        limited_time_label: limited_time_label?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Another product already uses this URL slug" }, { status: 409 })
      }
      throw error
    }

    // Update variants in place so ids (carts, order history, Printify links) survive edits
    const keptIds = new Set<string>()
    for (const v of parsed.variants) {
      const row = {
        title: v.title,
        sku: v.sku,
        price: v.price,
        compare_at_price: v.compare_at_price,
        inventory: v.inventory,
        options: v.options,
        is_available: true,
      }
      if (v.id) {
        keptIds.add(v.id)
        const { error: updError } = await admin.from("product_variants").update(row).eq("id", v.id)
        if (updError) throw updError
      } else {
        const { error: insError } = await admin.from("product_variants").insert({ ...row, product_id: id })
        if (insError) throw insError
      }
    }

    // Removed variants are hidden, not deleted, because past orders reference them
    const removed = [...existingIds].filter((vid) => !keptIds.has(vid))
    if (removed.length) {
      const { error: hideError } = await admin
        .from("product_variants")
        .update({ is_available: false })
        .in("id", removed)
      if (hideError) throw hideError
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error("Update product error:", err)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const admin = createAdminClient()
    const { error } = await admin.from("products").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete product error:", err)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
