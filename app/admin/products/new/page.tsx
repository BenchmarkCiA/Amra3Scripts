import ProductForm from "@/components/admin/ProductForm"
import { createAdminClient } from "@/lib/supabase/admin"

export default async function NewProductPage() {
  const supabase = createAdminClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Add Product</h1>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
