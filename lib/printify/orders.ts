import { printify } from "./client"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Address } from "@/types"

export interface PrintifyLine {
  printify_product_id: string | null
  printify_variant_id: string | null
  quantity: number
}

export async function submitPrintifyOrder(orderId: string, lines: PrintifyLine[], address: Address) {
  const shopId = process.env.PRINTIFY_SHOP_ID
  if (!shopId) return

  const line_items = lines
    .filter((l) => l.printify_product_id && l.printify_variant_id)
    .map((l) => ({
      product_id: l.printify_product_id!,
      variant_id: parseInt(l.printify_variant_id!, 10),
      quantity: l.quantity,
    }))

  if (!line_items.length) return

  const supabase = createAdminClient()
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
    // Leave a visible trace for the admin instead of failing silently
    await supabase
      .from("orders")
      .update({ notes: `Printify submission failed: ${(err as Error).message ?? "unknown error"}` })
      .eq("id", orderId)
  }
}
