export const dynamic = "force-dynamic"

import Link from "next/link"
import Image from "next/image"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPrice } from "@/lib/utils/currency"

const ALL_REGIONS = [
  { code: "il", label: "🇮🇱 Israel" },
  { code: "us", label: "🇺🇸 United States" },
  { code: "gb", label: "🇬🇧 United Kingdom" },
  { code: "de", label: "🇩🇪 Germany" },
  { code: "fr", label: "🇫🇷 France" },
  { code: "it", label: "🇮🇹 Italy" },
]

type Props = { searchParams: Promise<{ region?: string }> }

export default async function AdminProductsPage({ searchParams }: Props) {
  const { region } = await searchParams
  const activeRegion = region && region !== "all" ? region : null

  const supabase = createAdminClient()
  let query = supabase
    .from("products")
    .select("id, title, type, status, images, country_codes, variants:product_variants(price), category:categories(name)")
    .order("created_at", { ascending: false })

  if (activeRegion) {
    query = query.or(`country_codes.is.null,country_codes.cs.["${activeRegion}"]`)
  }

  const { data: products } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Region tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Link
          href="/admin/products"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !activeRegion
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          All regions
        </Link>
        {ALL_REGIONS.map((r) => (
          <Link
            key={r.code}
            href={`/admin/products?region=${r.code}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeRegion === r.code
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-14" />
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Regions</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price from</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products?.map((p) => {
              const prices = (p.variants as { price: number }[])?.map((v) => v.price) ?? []
              const minPrice = prices.length ? Math.min(...prices) : null
              const thumbnail = (p.images as string[] | null)?.[0] ?? null
              const countryCodes = p.country_codes as string[] | null
              return (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    {thumbnail ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 relative">
                        <Image
                          src={thumbnail}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-muted-foreground text-xs">—</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-medium">{p.title}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.type === "printify" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {(p.category as { name: string } | null)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    {countryCodes?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {countryCodes.map((code) => {
                          const r = ALL_REGIONS.find((r) => r.code === code)
                          return (
                            <span key={code} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {r ? r.label.split(" ")[0] : code}
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">All</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === "active" ? "bg-success/10 text-success" :
                      p.status === "draft" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {minPrice !== null ? formatPrice(minPrice, "USD") : "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-accent hover:underline text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
            {!products?.length && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                  {activeRegion
                    ? `No products visible in ${ALL_REGIONS.find((r) => r.code === activeRegion)?.label ?? activeRegion}.`
                    : <>No products yet.{" "}
                        <Link href="/admin/products/new" className="text-accent hover:underline">Add one</Link>{" "}
                        or{" "}
                        <Link href="/admin/products/printify" className="text-accent hover:underline">sync from Printify</Link>.
                      </>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {activeRegion
          ? `Showing products visible in ${ALL_REGIONS.find((r) => r.code === activeRegion)?.label ?? activeRegion} (includes products set to "All regions").`
          : `Showing all ${products?.length ?? 0} products across all regions.`
        }
      </p>
    </div>
  )
}
