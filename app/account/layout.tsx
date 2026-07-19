import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?next=/account")
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">OTZMA</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/account" className="font-medium hover:text-accent transition-colors">My Orders</Link>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign Out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-10">
        {children}
      </main>
    </div>
  )
}
