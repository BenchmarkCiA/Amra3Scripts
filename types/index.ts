export type ProductType = "printify" | "manual"
export type ProductStatus = "draft" | "active" | "archived"
export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled"
export type Currency = "USD" | "ILS" | "GBP"

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  position: number
  is_active: boolean
}

export interface ProductImage {
  url: string
  alt?: string
  position: number
}

export interface Product {
  id: string
  type: ProductType
  printify_id?: string
  title: string
  description?: string
  slug: string
  category_id?: string
  images: ProductImage[]
  tags: string[]
  status: ProductStatus
  is_featured: boolean
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  printify_variant_id?: string
  title: string
  sku?: string
  price: number
  price_ils?: number
  compare_at_price?: number
  cost?: number
  inventory: number
  options: Record<string, string>
  weight?: number
  is_available: boolean
}

export interface CartItem {
  product_id: string
  variant_id: string
  quantity: number
  product?: Product
  variant?: ProductVariant
}

export interface Address {
  first_name: string
  last_name: string
  address1: string
  address2?: string
  city: string
  state?: string
  zip: string
  country: string
  phone?: string
}

export interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer_email: string
  status: OrderStatus
  fulfillment_status: FulfillmentStatus
  stripe_payment_intent_id?: string
  printify_order_id?: string
  subtotal: number
  shipping_cost: number
  tax: number
  discount: number
  total: number
  currency: Currency
  shipping_address: Address
  billing_address?: Address
  notes?: string
  tracking_number?: string
  tracking_url?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  product_type: ProductType
  title: string
  variant_title?: string
  sku?: string
  quantity: number
  unit_price: number
  total_price: number
  image_url?: string
}
