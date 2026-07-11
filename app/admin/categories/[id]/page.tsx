import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import CategoryForm from "@/components/admin/CategoryForm"

export const dynamic = "force-dynamic"

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== process.env.ADMIN_EMAIL) redirect("/admin")

  const { id } = await params
  const admin = createAdminClient()
  const { data: category } = await admin
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  if (!category) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  )
}
