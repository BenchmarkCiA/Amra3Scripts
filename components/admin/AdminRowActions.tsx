"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

interface Props {
  editHref: string
  apiPath: string
  isActive: boolean
  itemLabel: string
  activateLabel: string
  deactivateLabel: string
  deleteConfirm: string
}

/** Edit / toggle-active / delete buttons for admin list rows, with visible errors. */
export default function AdminRowActions({
  editHref, apiPath, isActive, itemLabel, activateLabel, deactivateLabel, deleteConfirm,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(init: RequestInit, failMessage: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(apiPath, init)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? failMessage)
        return
      }
      router.refresh()
    } catch {
      setError("Network error — please try again")
    } finally {
      setLoading(false)
    }
  }

  const toggle = () =>
    run(
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !isActive }) },
      "Could not update"
    )

  const remove = () => {
    if (!confirm(deleteConfirm)) return
    run({ method: "DELETE" }, "Could not delete")
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Link
          href={editHref}
          aria-label={`Edit ${itemLabel}`}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
        </Link>
        <button
          onClick={toggle}
          disabled={loading}
          className={`text-xs px-2 py-1 rounded font-medium transition-colors disabled:opacity-50 ${
            isActive
              ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          {isActive ? deactivateLabel : activateLabel}
        </button>
        <button
          onClick={remove}
          disabled={loading}
          aria-label={`Delete ${itemLabel}`}
          className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
