import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils/slug"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, category_id, tags, status, is_featured, images, seo_title, seo_description, variants } = body

    if (!title || !variants?.length) {
      return NextResponse.json({ error: "Title and at least one variant are required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const slug = slugify(title)

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
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A product with this title already exists" }, { status: 409 })
      }
      throw error
    }

    const variantRows = variants.map((v: {
      title: string
      sku?: string
      price: number
      compare_at_price?: number
      inventory?: number
      options?: Record<string, string>
    }) => ({
      product_id: product.id,
      title: v.title,
      sku: v.sku || null,
      price: parseFloat(String(v.price)),
      compare_at_price: v.compare_at_price ? parseFloat(String(v.compare_at_price)) : null,
      inventory: v.inventory ?? -1,
      options: v.options || {},
      is_available: true,
    }))

    const { error: variantError } = await admin.from("product_variants").insert(variantRows)
    if (variantError) throw variantError

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error("Create product error:", err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
