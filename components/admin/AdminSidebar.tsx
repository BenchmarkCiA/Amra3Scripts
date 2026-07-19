"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  RefreshCw,
  Store,
  Globe,
  Settings,
  Tag,
  FolderOpen,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/products/printify", label: "Printify Sync", icon: RefreshCw },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/country-settings", label: "Storefronts", icon: Globe },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/chat", label: "Chat Widget", icon: MessageCircle },
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-primary text-primary-foreground flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-primary-foreground/20">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:opacity-80">
          <Store className="w-4 h-4" />
          View Store
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
