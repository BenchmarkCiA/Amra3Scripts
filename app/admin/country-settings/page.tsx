export const dynamic = "force-dynamic"

import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { COUNTRIES } from "@/lib/countries"

export default async function CountrySettingsPage() {
  const supabase = createAdminClient()
  const { data: settings } = await supabase
    .from("country_settings")
    .select("country_code, hero_image_url, seo, content")

  const settingsMap = Object.fromEntries(
    (settings ?? []).map((s) => [s.country_code, s])
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Storefronts</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configure the campaign image, page text, and SEO for each country storefront.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Country</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Campaign image</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">Custom text</th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">SEO</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Object.values(COUNTRIES).map((country) => {
              const s = settingsMap[country.code]
              const hasImage = !!s?.hero_image_url
              const hasContent = s?.content && Object.keys(s.content).length > 0
              const hasSeo = s?.seo && Object.keys(s.seo).length > 0

              return (
                <tr key={country.code} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://flagcdn.com/w40/${country.code}.png`}
                        alt=""
                        width={28}
                        height={19}
                        style={{ borderRadius: 2, display: "block", flexShrink: 0 }}
                      />
                      <div>
                        <div className="font-semibold">{country.nameEn}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{country.en}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge active={hasImage} activeLabel="Uploaded" inactiveLabel="None" />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge active={!!hasContent} activeLabel="Custom" inactiveLabel="Default" />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge active={!!hasSeo} activeLabel="Custom" inactiveLabel="Default" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/country-settings/${country.code}`}
                      className="text-accent hover:underline text-sm font-medium"
                    >
                      Configure →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
    }`}>
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
