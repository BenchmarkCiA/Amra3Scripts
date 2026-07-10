"use client"

import { useState } from "react"
import { RefreshCw, Store, Copy, Check } from "lucide-react"

interface PrintifyShop {
  id: number
  title: string
  sales_channel: string
}

export default function PrintifySyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ synced: number; errors: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [shops, setShops] = useState<PrintifyShop[] | null>(null)
  const [shopsLoading, setShopsLoading] = useState(false)
  const [shopsError, setShopsError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch("/api/printify/sync", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Sync failed")
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setSyncing(false)
    }
  }

  const handleFetchShops = async () => {
    setShopsLoading(true)
    setShopsError(null)
    setShops(null)
    try {
      const res = await fetch("/api/printify/shops")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch shops")
      setShops(data)
    } catch (err) {
      setShopsError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setShopsLoading(false)
    }
  }

  const copyId = (id: number) => {
    navigator.clipboard.writeText(String(id))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="max-w-lg space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Printify Sync</h1>
        <p className="text-muted-foreground">
          Pull all products from your Printify shop into the store.
        </p>
      </div>

      {/* Step 1 — Find Shop ID */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <h2 className="font-semibold">Find your Shop ID</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Click below to see all shops linked to your Printify API token. Copy the ID of the shop you want to sync.
        </p>

        <button
          onClick={handleFetchShops}
          disabled={shopsLoading}
          className="flex items-center gap-2 border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Store className="w-4 h-4" />
          {shopsLoading ? "Loading..." : "Show my Printify shops"}
        </button>

        {shopsError && (
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-destructive text-sm font-medium">Error</p>
            <p className="text-sm text-muted-foreground mt-1">{shopsError}</p>
            {shopsError.includes("PRINTIFY_API_TOKEN") && (
              <p className="text-sm mt-2">
                Go to <strong>Vercel &rarr; Settings &rarr; Environment Variables</strong> and add <code className="bg-muted px-1 rounded">PRINTIFY_API_TOKEN</code> with your token from Printify &rarr; My Account &rarr; Connections &rarr; API.
              </p>
            )}
          </div>
        )}

        {shops && shops.length > 0 && (
          <div className="space-y-2">
            {shops.map((shop) => (
              <div key={shop.id} className="flex items-center justify-between border border-border rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{shop.title}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: <code className="font-mono">{shop.id}</code> &middot; {shop.sales_channel}
                  </p>
                </div>
                <button
                  onClick={() => copyId(shop.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors font-medium"
                >
                  {copiedId === shop.id ? (
                    <><Check className="w-3.5 h-3.5 text-green-600" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy ID</>
                  )}
                </button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">
              Add <code className="bg-muted px-1 rounded">PRINTIFY_SHOP_ID</code> to your Vercel environment variables with the copied value.
            </p>
          </div>
        )}

        {shops && shops.length === 0 && (
          <p className="text-sm text-muted-foreground">No shops found on this Printify account.</p>
        )}
      </div>

      {/* Step 2 — Sync */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <h2 className="font-semibold">Sync products</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Once both <code className="bg-muted px-1 rounded">PRINTIFY_API_TOKEN</code> and <code className="bg-muted px-1 rounded">PRINTIFY_SHOP_ID</code> are set in Vercel, click here to import all your products.
        </p>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync from Printify"}
        </button>

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">Sync complete!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.synced} products synced{result.errors > 0 ? `, ${result.errors} errors` : ""}.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-destructive font-medium">Sync failed</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
