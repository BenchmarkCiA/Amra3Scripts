import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils/slug"

type Params = { params: Promise<{ id: string }> }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null
  return user
}

export async function PUT(request: NextRequest, { params }: Params) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  try {
    const body = await request.json()
    const { title, description, category_id, tags, status, is_featured, images, seo_title, seo_description, variants, country_codes, allow_personalization } = body

    if (!title || !variants?.length) {
      return NextResponse.json({ error: "Title and at least one variant are required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const slug = slugify(title)

    const { data: product, error } = await admin
      .from("products")
      .update({
        title,
        description: description || null,
        slug,
        category_id: category_id || null,
        tags: tags || [],
        status: status || "draft",
        is_featured: is_featured || false,
        images: images || [],
        seo_title: seo_title || null,
        seo_description: seo_description || null,
        country_codes: country_codes?.length ? country_codes : null,
        allow_personalization: allow_personalization === true,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A product with this title already exists" }, { status: 409 })
      }
      throw error
    }

    // Replace all variants: delete existing, insert new
    const { error: deleteError } = await admin
      .from("product_variants")
      .delete()
      .eq("product_id", id)
    if (deleteError) throw deleteError

    const variantRows = variants.map((v: {
      title: string
      sku?: string
      price: number
      compare_at_price?: number
      inventory?: number
      options?: Record<string, string>
    }) => ({
      product_id: id,
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
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
