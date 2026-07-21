export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { COUNTRIES, isValidCountry } from "@/lib/countries"
import CountryImageCard from "@/components/admin/CountryImageCard"
import CountryContentForm from "@/components/admin/CountryContentForm"

export default async function CountrySettingsDetailPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  if (!isValidCountry(code)) notFound()

  const country = COUNTRIES[code]
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("country_settings")
    .select("hero_image_url, content, seo")
    .eq("country_code", code)
    .single()

  const isHe = code === "il"

  const defaults = isHe
    ? {
        announcement: `כיתוב אישי על כל פריט · משלוח ל${country.shipLabel} · החזרה חינם 30 יום`,
        heroH1a: "השורשים שלך.",
        heroH1b: "בלי התנצלות.",
        heroLead: `קולקציית ${country.nameHe} — הלבשה וציוד שנושאים את הכיתוב שאתה בוחר. הזהות שלך, בגוף ראשון.`,
        heroCta1: "לכל הקולקציה",
        heroCta2: "עיצוב את שלך",
        collectionTitle: `הקולקציה של ${country.nameHe}`,
        stat1Label: "+2,400",  stat1Sub: "לקוחות מרוצים",
        stat2Label: "100%",    stat2Sub: "כיתוב אישי",
        stat3Label: "30 יום",  stat3Sub: "החזרה חינם",
        customizerH2a: "הכיתוב שלך.",
        customizerH2b: "העוצמה שלך.",
        customizerLead: "הוסף את השם שלך, שנה משמעותית, ציטוט מהלב — על כל פריט בקולקציה. זו הזהות שלך.",
        customizerLabel: "הכיתוב שלך",
        footerBadge: "שם ולוגו זמניים",
        defaultMetaTitle: `קולקציית ${country.nameHe} | עוצמה`,
        defaultMetaDescription: `הלבשה וציוד עם כיתוב אישי עבור ${country.nameHe}. הזהות שלך, בגוף ראשון.`,
      }
    : {
        announcement: `Personal text on every item · Shipping to ${country.shipLabelEn} · Free returns 30 days`,
        heroH1a: "Your roots.",
        heroH1b: "No apologies.",
        heroLead: `The ${country.nameEn} collection — apparel and gear carrying the text you choose. Your identity, in the first person.`,
        heroCta1: "See full collection",
        heroCta2: "Design yours",
        collectionTitle: `The ${country.nameEn} Collection`,
        stat1Label: "+2,400",   stat1Sub: "happy customers",
        stat2Label: "100%",     stat2Sub: "personal text",
        stat3Label: "30 days",  stat3Sub: "free returns",
        customizerH2a: "Your text.",
        customizerH2b: "Your strength.",
        customizerLead: "Add your name, a meaningful year, a quote from the heart — on every item in the collection. This is your identity.",
        customizerLabel: "Your text",
        footerBadge: "Placeholder name & logo",
        defaultMetaTitle: `${country.nameEn} Collection | OTZMA`,
        defaultMetaDescription: `Premium personalized apparel and gear for ${country.nameEn}. Your roots, your text, delivered to your door.`,
      }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/country-settings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          alt=""
          width={28}
          height={19}
          style={{ borderRadius: 2, display: "block" }}
        />
        <h1 className="text-2xl font-bold">{country.nameEn}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Campaign Image
          </p>
          <CountryImageCard country={country} currentUrl={data?.hero_image_url ?? null} />
        </div>

        <div className="lg:col-span-2">
          <CountryContentForm
            country={country}
            initialContent={(data?.content ?? {}) as Record<string, string>}
            initialSeo={(data?.seo ?? {}) as Record<string, string>}
            defaults={defaults}
          />
        </div>
      </div>
    </div>
  )
}
