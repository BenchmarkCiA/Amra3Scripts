"use client"

import { useState } from "react"

const STATUS_OPTIONS = [
  { value: "",                  label: "— Not set (shows as Processing) —" },
  { value: "in_preparation",    label: "In Preparation" },
  { value: "in_delivery",       label: "In Delivery" },
  { value: "waiting_for_pickup",label: "Waiting for Pickup" },
  { value: "picked_up",         label: "Picked Up" },
]

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string | null
}) {
  const [status, setStatus] = useState(currentStatus ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_status: status || null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={e => { setStatus(e.target.value); setSaved(false) }}
        className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white flex-1 max-w-xs"
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "✓ Saved" : "Update Status"}
      </button>
      <p className="text-xs text-muted-foreground">
        This is what the customer sees in their account.
      </p>
    </div>
  )
}
