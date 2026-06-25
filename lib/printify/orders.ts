import { printify } from "./client"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Address } from "@/types"

export async function submitPrintifyOrder(
  orderId: string,
  variants: { printify_variant_id?: string; price: number; product: unknown }[],
  items: { product_id: string; variant_id: string; quantity: number }[],
  address: Address
) {
  const shopId = process.env.PRINTIFY_SHOP_ID
  if (!shopId) return

  const supabase = createAdminClient()

  const line_items = items
    .map((item) => {
      const variant = variants.find((v) => item.variant_id === item.variant_id)
      if (!variant?.printify_variant_id) return null
      return {
        print_provider_id: 1,
        blueprint_id: 1,
        variant_id: parseInt(variant.printify_variant_id),
        quantity: item.quantity,
      }
    })
    .filter(Boolean)

  if (!line_items.length) return

  try {
    const order = await printify.post(`/shops/${shopId}/orders.json`, {
      external_id: orderId,
      label: `Order ${orderId}`,
      line_items,
      shipping_method: 1,
      send_shipping_notification: true,
      address_to: {
        first_name: address.first_name,
        last_name: address.last_name,
        address1: address.address1,
        address2: address.address2 ?? "",
        city: address.city,
        state: address.state ?? "",
        zip: address.zip,
        country: address.country,
        phone: address.phone ?? "",
      },
    })

    await supabase
      .from("orders")
      .update({ printify_order_id: order.id, status: "processing" })
      .eq("id", orderId)
  } catch (err) {
    console.error("Printify order submission failed:", err)
  }
}
