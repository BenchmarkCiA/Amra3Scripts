export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { COUNTRIES, isValidCountry } from "@/lib/countries"
import { createClient } from "@/lib/supabase/server"
import CountryStorefront from "@/components/store/CountryStorefront"
import type { Product } from "@/types"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>
}): Promise<Metadata> {
  const { country: countryParam } = await params
  const code = countryParam.toLowerCase()
  if (!isValidCountry(code)) return {}

  const country = COUNTRIES[code]
  const supabase = await createClient()
  const { data } = await supabase
    .from("country_settings")
    .select("seo")
    .eq("country_code", code)
    .single()

  const seo = data?.seo as { metaTitle?: string; metaDescription?: string } | null
  const isHe = code === "il"
  const defaultTitle = isHe
    ? `קולקציית ${country.nameHe} | עוצמה`
    : `${country.nameEn} Collection | OTZMA`
  const defaultDescription = isHe
    ? `הלבשה וציוד עם כיתוב אישי עבור ${country.nameHe}. הזהות שלך, בגוף ראשון.`
    : `Premium personalized apparel and gear for ${country.nameEn}. Your roots, your text, delivered to your door.`

  return {
    title: seo?.metaTitle || defaultTitle,
    description: seo?.metaDescription || defaultDescription,
  }
}

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
  const [productsResult, settingsResult, siteSettingsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*, variants:product_variants(*), category:categories(*)")
      .eq("status", "active"),
    supabase
      .from("country_settings")
      .select("hero_image_url, content")
      .eq("country_code", code)
      .single(),
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "social_links")
      .single(),
  ])

  return (
    <CountryStorefront
      country={COUNTRIES[code]}
      products={(productsResult.data ?? []) as Product[]}
      heroImageUrl={settingsResult.data?.hero_image_url ?? null}
      contentOverrides={settingsResult.data?.content ?? null}
      socialLinks={siteSettingsResult.data?.value ?? null}
    />
  )
}
