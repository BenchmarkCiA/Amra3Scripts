export const dynamic = "force-dynamic"

import { createAdminClient } from "@/lib/supabase/admin"
import { COUNTRIES } from "@/lib/countries"
import CountryImageCard from "@/components/admin/CountryImageCard"

export default async function CountrySettingsPage() {
  const supabase = createAdminClient()
  const { data: settings } = await supabase
    .from("country_settings")
    .select("country_code, hero_image_url")

  const settingsMap = Object.fromEntries(
    (settings ?? []).map((s) => [s.country_code, s.hero_image_url as string | null])
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Storefront Images</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload a campaign hero image for each country storefront. Recommended: 800×900 px, JPG or WebP, under 500 KB.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(COUNTRIES).map((country) => (
          <CountryImageCard
            key={country.code}
            country={country}
            currentUrl={settingsMap[country.code] ?? null}
          />
        ))}
      </div>
    </div>
  )
}
