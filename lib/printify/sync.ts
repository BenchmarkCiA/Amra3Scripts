import { printify } from "./client"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils/slug"

interface PrintifyVariant {
  id: number
  title: string
  sku: string
  cost: number
  price: number
  is_available: boolean
  options: number[]
}

interface PrintifyProduct {
  id: string
  title: string
  description: string
  images: { src: string; position: number }[]
  variants: PrintifyVariant[]
  options: { name: string; values: { id: number; title: string }[] }[]
  tags: string[]
}

export async function syncPrintifyProducts(): Promise<{ synced: number; errors: number }> {
  const shopId = process.env.PRINTIFY_SHOP_ID
  if (!shopId) throw new Error("PRINTIFY_SHOP_ID not set")

  const supabase = createAdminClient()
  let synced = 0
  let errors = 0
  let page = 1

  while (true) {
    const data = await printify.get(`/shops/${shopId}/products.json?page=${page}&limit=100`)
    const products: PrintifyProduct[] = data.data

    if (!products?.length) break

    for (const p of products) {
      try {
        const slug = slugify(p.title)
        const images = p.images.map((img, i) => ({
          url: img.src,
          alt: p.title,
          position: i,
        }))

        const { data: product, error } = await supabase
          .from("products")
          .upsert(
            {
              type: "printify",
              printify_id: p.id,
              title: p.title,
              description: p.description,
              slug,
              images,
              tags: p.tags ?? [],
              status: "active",
            },
            { onConflict: "printify_id" }
          )
          .select()
          .single()

        if (error || !product) {
          errors++
          continue
        }

        // Build option map: option_value_id -> title
        const optionMap: Record<number, { key: string; val: string }> = {}
        p.options.forEach((opt) => {
          opt.values.forEach((v) => {
            optionMap[v.id] = { key: opt.name.toLowerCase(), val: v.title }
          })
        })

        // Upsert variants
        const variantRows = p.variants.map((v) => {
          const options: Record<string, string> = {}
          v.options.forEach((optId) => {
            const o = optionMap[optId]
            if (o) options[o.key] = o.val
          })
          return {
            product_id: product.id,
            printify_variant_id: String(v.id),
            title: v.title,
            sku: v.sku,
            price: v.price / 100,
            cost: v.cost / 100,
            options,
            is_available: v.is_available,
          }
        })

        await supabase
          .from("product_variants")
          .upsert(variantRows, { onConflict: "printify_variant_id" })

        synced++
      } catch (err) {
        console.error(`Failed to sync product ${p.id}:`, err)
        errors++
      }
    }

    if (products.length < 100) break
    page++
  }

  return { synced, errors }
}
