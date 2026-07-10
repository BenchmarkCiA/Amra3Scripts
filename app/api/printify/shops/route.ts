import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.PRINTIFY_API_TOKEN) {
    return NextResponse.json({ error: "PRINTIFY_API_TOKEN is not set" }, { status: 500 })
  }

  const res = await fetch("https://api.printify.com/v1/shops.json", {
    headers: {
      Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `Printify error ${res.status}: ${text}` }, { status: 500 })
  }

  const shops = await res.json()
  return NextResponse.json(shops)
}
