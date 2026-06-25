import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { product_id, variant_id, quantity } = await request.json()

    if (!product_id || !variant_id || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: variant } = await supabase
      .from("product_variants")
      .select("*, product:products(title, images)")
      .eq("id", variant_id)
      .eq("product_id", product_id)
      .eq("is_available", true)
      .single()

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 })
    }

    const product = variant.product as { title: string; images: { url: string }[] }

    return NextResponse.json({
      item: {
        product_id,
        variant_id,
        quantity,
        title: product.title,
        variant_title: variant.title,
        price: variant.price,
        image_url: product.images?.[0]?.url ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
