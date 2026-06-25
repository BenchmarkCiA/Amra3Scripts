"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"

export default function PrintifySyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{ synced: number; errors: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Printify Sync</h1>
      <p className="text-muted-foreground mb-8">
        Pull all products from your Printify shop into the store. Existing products will be updated.
      </p>

      <div className="bg-white rounded-xl border border-border p-6">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync from Printify"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-success/10 rounded-lg">
            <p className="text-success font-medium">Sync complete!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.synced} products synced{result.errors > 0 ? `, ${result.errors} errors` : ""}.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
            <p className="text-destructive font-medium">Sync failed</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
