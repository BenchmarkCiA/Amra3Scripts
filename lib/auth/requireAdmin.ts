import { createClient } from "@/lib/supabase/server"

/** Returns the signed-in user if they are the store admin, otherwise null. */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !process.env.ADMIN_EMAIL || user.email !== process.env.ADMIN_EMAIL) return null
  return user
}
