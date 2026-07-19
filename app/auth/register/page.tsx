"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/account"

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [marketing, setMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (!/^[a-zA-Z0-9]{8,}$/.test(password)) {
      setError("Password may only contain letters and digits (min 8 characters).")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const nameParts = fullName.trim().split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ") || null

      await supabase.from("customers").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        marketing_consent: marketing,
      })
    }

    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="bg-white rounded-2xl border border-border shadow-sm w-full max-w-sm p-8">
        <h1 className="text-xl font-bold mb-1">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Track your orders and manage your profile.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Jane Smith"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Min 8 letters or digits"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-muted-foreground mt-1">At least 8 letters or digits.</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketing}
              onChange={e => setMarketing(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-accent"
            />
            <span className="text-sm text-muted-foreground">
              I agree to receive promotional emails and updates. You can unsubscribe at any time.
            </span>
          </label>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/auth/login?next=/account" className="text-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
