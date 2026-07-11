"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

interface Props {
  id: string
  isActive: boolean
}

export default function CategoryActions({ id, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    })
    router.refresh()
    setLoading(false)
  }

  const deleteCategory = async () => {
    if (!confirm("Delete this category? Products in it will not be deleted.")) return
    setLoading(true)
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/categories/${id}`}
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        onClick={toggle}
        disabled={loading}
        className={`text-xs px-2 py-1 rounded font-medium transition-colors disabled:opacity-50 ${
          isActive
            ? "bg-muted text-muted-foreground hover:bg-muted/80"
            : "bg-green-100 text-green-700 hover:bg-green-200"
        }`}
      >
        {isActive ? "Hide" : "Show"}
      </button>
      <button
        onClick={deleteCategory}
        disabled={loading}
        className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
