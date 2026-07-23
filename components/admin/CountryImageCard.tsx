"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Country } from "@/lib/countries"

interface Props {
  country: Country
  currentUrl: string | null
}

export default function CountryImageCard({ country, currentUrl }: Props) {
  const [url, setUrl] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("country_code", country.code)
      const res = await fetch("/api/upload/campaign", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setUrl(json.url)
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setUploading(true)
    setError(null)
    try {
      const res = await fetch("/api/upload/campaign", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: country.code }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setUrl(null)
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div
        className="relative bg-muted/30 flex items-center justify-center cursor-pointer group"
        style={{ aspectRatio: "3 / 2" }}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {url ? (
          <>
            <Image
              src={url}
              alt={country.nameEn}
              fill
              style={{ objectFit: "cover" }}
              sizes="400px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-6 text-center">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Click to upload</span>
            <span className="text-xs">JPG, WebP · 1200×800 px (3:2) · max 2 MB</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm text-muted-foreground animate-pulse">Uploading…</span>
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://flagcdn.com/w40/${country.code}.png`}
            alt=""
            width={24}
            height={16}
            style={{ borderRadius: 2, display: "block" }}
          />
          <div>
            <div className="text-sm font-semibold">{country.nameEn}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{country.en}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {url ? "Replace" : "Upload"}
          </button>
          {url && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
              aria-label="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 pb-3 text-xs text-destructive">{error}</div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/webp,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
