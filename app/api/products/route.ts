import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugOrFallback } from "@/lib/utils/slug"
import { normalizeVariants } from "@/lib/products/variants"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, category_id, tags, status, is_featured, images, seo_title, seo_description, country_codes, allow_personalization, limited_time_label } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (status && !["draft", "active", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    const parsed = normalizeVariants(body.variants)
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })

    const admin = createAdminClient()
    const slug = slugOrFallback(title, "product")

    const { data: product, error } = await admin
      .from("products")
      .insert({
        type: "manual",
        title,
        description,
        slug,
        category_id: category_id || null,
        tags: tags || [],
        status: status || "draft",
        is_featured: is_featured || false,
        images: images || [],
        seo_title,
        seo_description,
        country_codes: country_codes?.length ? country_codes : null,
        allow_personalization: allow_personalization === true,
        limited_time_label: limited_time_label?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A product with this title already exists" }, { status: 409 })
      }
      throw error
    }

    const variantRows = parsed.variants.map(({ id: _ignored, ...v }) => {
      void _ignored
      return { ...v, product_id: product.id, is_available: true }
    })

    const { error: variantError } = await admin.from("product_variants").insert(variantRows)
    if (variantError) {
      // Don't leave a product without variants behind
      await admin.from("products").delete().eq("id", product.id)
      throw variantError
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error("Create product error:", err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
