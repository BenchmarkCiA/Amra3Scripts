import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import CouponForm from "@/components/admin/CouponForm"

export const dynamic = "force-dynamic"

export default async function NewCouponPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== process.env.ADMIN_EMAIL) redirect("/admin")

  const admin = createAdminClient()
  const [{ data: products }, { data: categories }] = await Promise.all([
    admin.from("products").select("id, title").order("title"),
    admin.from("categories").select("id, name").order("name"),
  ])

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">New Coupon</h1>
      <CouponForm products={products ?? []} categories={categories ?? []} />
    </div>
  )
}
