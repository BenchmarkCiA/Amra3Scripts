export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SiteSettingsForm from "@/components/admin/SiteSettingsForm"

export default async function SiteSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/admin/login")
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Social media links shown in the storefront footer and order confirmation page.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold mb-4">Social Media Links</h2>
        <SiteSettingsForm />
      </section>
    </div>
  )
}
