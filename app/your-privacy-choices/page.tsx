"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"

type RequestType = "access" | "delete" | "correct" | "opt_out"

const REQUEST_LABELS: Record<RequestType, { label: string; description: string }> = {
  access:   { label: "Access my data",           description: "Receive a copy of all personal data we hold about you." },
  delete:   { label: "Delete my data",           description: "Request erasure of your personal data (right to be forgotten)." },
  correct:  { label: "Correct my data",          description: "Update or correct inaccurate personal data." },
  opt_out:  { label: "Opt out of sale / sharing", description: "Opt out of the sale or sharing of your personal data for targeted advertising." },
}

export default function YourPrivacyChoicesPage() {
  const [type, setType] = useState<RequestType>("access")
  const [email, setEmail] = useState("")
  const [details, setDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const res = await fetch("/api/dsar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_type: type, email, details }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Your Privacy Choices</h1>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        Under applicable privacy law you have rights over your personal data. Use this form to submit
        a Data Subject Request. We will respond within <strong>30 days</strong> (UK/EU: 1 calendar month).
        See our <a href="/privacy-policy" className="underline">Privacy Policy</a> for details.
      </p>

      {done ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <h2 className="text-xl font-semibold">Request received</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            We&apos;ve logged your request and will contact you at <strong>{email}</strong> within 30 days.
          </p>
          <a href="/" className="mt-4 text-sm underline text-muted-foreground">Back to store</a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Request type */}
          <fieldset>
            <legend className="text-sm font-semibold mb-3">What would you like to do?</legend>
            <div className="flex flex-col gap-2">
              {(Object.entries(REQUEST_LABELS) as [RequestType, { label: string; description: string }][]).map(
                ([value, { label, description }]) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      type === value ? "border-primary bg-muted/40" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="request_type"
                      value={value}
                      checked={type === value}
                      onChange={() => setType(value)}
                      className="mt-0.5 accent-primary"
                    />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </label>
                )
              )}
            </div>
          </fieldset>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">Your email address <span className="text-destructive">*</span></label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">Additional details <span className="text-muted-foreground font-normal">(optional)</span></label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Describe your request in more detail, e.g. which data or time period you're asking about."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="self-start px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>

          <p className="text-xs text-muted-foreground">
            We may ask you to verify your identity before fulfilling your request. Submitting this
            form does not automatically delete your account or cancel any active orders.
          </p>
        </form>
      )}
    </main>
  )
}
