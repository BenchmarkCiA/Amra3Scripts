-- Customer-facing fulfillment status set by admin
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_status TEXT
  CHECK (customer_status IN ('in_preparation', 'in_delivery', 'waiting_for_pickup', 'picked_up'));

-- Full name convenience column on customers
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Index for linking orders to customers by email after Stripe payment
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);

COMMENT ON COLUMN public.orders.customer_status IS
  'Customer-visible fulfillment status set by admin. NULL = not yet set (shows as Processing to customer).';
