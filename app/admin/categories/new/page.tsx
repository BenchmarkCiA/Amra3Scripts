import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CategoryForm from "@/components/admin/CategoryForm"

export const dynamic = "force-dynamic"

export default async function NewCategoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== process.env.ADMIN_EMAIL) redirect("/admin")

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">New Category</h1>
      <CategoryForm />
    </div>
  )
}
