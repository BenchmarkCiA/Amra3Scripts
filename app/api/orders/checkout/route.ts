import { NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe/checkout"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    if (!items || !items.length) {
      return NextResponse.json({ error: "No items" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const session = await createCheckoutSession(items, user?.email)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
