export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { COUNTRIES, isValidCountry } from "@/lib/countries"
import { createClient } from "@/lib/supabase/server"
import CountryStorefront from "@/components/store/CountryStorefront"
import type { Product } from "@/types"

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country: countryParam } = await params
  const code = countryParam.toLowerCase()

  if (!isValidCountry(code)) {
    redirect("/")
  }

  const supabase = await createClient()
  const { data: products } = await supabase
    .from("products")
    .select("*, variants:product_variants(*), category:categories(*)")
    .eq("status", "active")

  return (
    <CountryStorefront
      country={COUNTRIES[code]}
      products={(products ?? []) as Product[]}
    />
  )
}
