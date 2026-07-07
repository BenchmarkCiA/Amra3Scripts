"use client"

import { useEffect, useState } from "react"

interface SocialLinks {
  instagram: string
  tiktok: string
  facebook: string
}

const defaultLinks: SocialLinks = { instagram: "", tiktok: "", facebook: "" }

export default function SiteSettingsForm() {
  const [links, setLinks] = useState<SocialLinks>(defaultLinks)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.json())
      .then((data) => {
        if (data?.social_links) {
          setLinks({ ...defaultLinks, ...data.social_links })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "social_links", value: links }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading…</p>
  }

  const fields: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle" },
    { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourhandle" },
    { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage" },
  ]

  return (
    <div className="max-w-lg flex flex-col gap-6">
      {fields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1.5">{label}</label>
          <input
            type="url"
            value={links[key]}
            onChange={(e) => setLinks((prev) => ({ ...prev, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
      ))}

      {error && <p className="text-destructive text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="self-start bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
      </button>
    </div>
  )
}
