"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MessageCircle, X, ChevronLeft, Send, Package, HelpCircle, Mail, Loader2 } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQ { id: string; question: string; answer: string }
interface OrderItem { title: string; quantity: number; image_url: string | null }
interface Order {
  id: string
  order_number: string
  customer_status: string | null
  total: number
  currency: string
  created_at: string
  order_items: OrderItem[]
}
interface ChatSettings {
  enabled: boolean
  position: "bottom-right" | "bottom-left"
  greeting: string
}

const STATUS_LABELS: Record<string, { label: string; emoji: string }> = {
  in_preparation:     { label: "In Preparation",     emoji: "🔧" },
  in_delivery:        { label: "In Delivery",         emoji: "🚚" },
  waiting_for_pickup: { label: "Waiting for Pickup",  emoji: "📦" },
  picked_up:          { label: "Picked Up",           emoji: "✅" },
}

const STATUS_STEPS = ["in_preparation", "in_delivery", "waiting_for_pickup", "picked_up"]

type Screen =
  | { id: "home" }
  | { id: "orders" }
  | { id: "order-detail"; order: Order }
  | { id: "faq"; faqId?: string }
  | { id: "contact" }
  | { id: "contact-sent" }

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const pathname = usePathname()
  const [config, setConfig] = useState<{ settings: ChatSettings; faqs: FAQ[] } | null>(null)
  const [open, setOpen] = useState(false)
  const [screen, setScreen] = useState<Screen>({ id: "home" })
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Hide on admin routes
  const isAdmin = pathname.startsWith("/admin")

  useEffect(() => {
    if (isAdmin) return
    fetch("/api/chat/config")
      .then(r => r.json())
      .then(setConfig)
      .catch(() => null)
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          name: data.user.user_metadata?.full_name?.split(" ")[0] ?? data.user.email?.split("@")[0] ?? "there",
        })
      }
    })
  }, [isAdmin])

  const loadOrders = async () => {
    if (ordersLoaded) return
    const res = await fetch("/api/chat/orders")
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders ?? [])
    }
    setOrdersLoaded(true)
  }

  if (isAdmin || !config?.settings?.enabled) return null

  const { settings, faqs } = config
  const pos = settings.position === "bottom-left"
    ? "left-4 sm:left-6"
    : "right-4 sm:right-6"

  const goBack = () => {
    if (screen.id === "order-detail") setScreen({ id: "orders" })
    else setScreen({ id: "home" })
  }

  const handleOpen = () => {
    setOpen(true)
    setScreen({ id: "home" })
  }

  return (
    <div className={`fixed bottom-4 sm:bottom-6 ${pos} z-50 flex flex-col items-end gap-3`}
      style={settings.position === "bottom-left" ? { alignItems: "flex-start" } : {}}>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          style={{ height: 480 }}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shrink-0">
            {screen.id !== "home" && (
              <button onClick={goBack} className="hover:opacity-70 transition-opacity">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex-1">
              <p className="font-semibold text-sm">Support</p>
              <p className="text-xs opacity-70">
                {screen.id === "home" && "How can we help?"}
                {screen.id === "orders" && "Your orders"}
                {screen.id === "order-detail" && (screen as { id: "order-detail"; order: Order }).order.order_number}
                {screen.id === "faq" && "FAQ"}
                {screen.id === "contact" && "Contact seller"}
                {screen.id === "contact-sent" && "Message sent"}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {screen.id === "home" && (
              <HomeScreen
                user={user}
                greeting={settings.greeting}
                faqs={faqs}
                onOrders={() => { loadOrders(); setScreen({ id: "orders" }) }}
                onFAQ={() => setScreen({ id: "faq" })}
                onContact={() => setScreen({ id: "contact" })}
                onFAQItem={(id) => setScreen({ id: "faq", faqId: id })}
              />
            )}
            {screen.id === "orders" && (
              <OrdersScreen
                orders={orders}
                loaded={ordersLoaded}
                onSelect={(order) => setScreen({ id: "order-detail", order })}
              />
            )}
            {screen.id === "order-detail" && (
              <OrderDetailScreen order={(screen as { id: "order-detail"; order: Order }).order} />
            )}
            {screen.id === "faq" && (
              <FAQScreen faqs={faqs} openId={(screen as { id: "faq"; faqId?: string }).faqId} />
            )}
            {screen.id === "contact" && (
              <ContactScreen
                user={user}
                onSent={() => setScreen({ id: "contact-sent" })}
              />
            )}
            {screen.id === "contact-sent" && (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center text-2xl">✓</div>
                <p className="font-semibold">Message sent!</p>
                <p className="text-sm text-muted-foreground">We&apos;ll get back to you as soon as possible.</p>
                <button
                  onClick={() => setScreen({ id: "home" })}
                  className="text-sm text-accent hover:underline mt-2"
                >
                  Back to home
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bubble */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open
          ? <X className="w-6 h-6" />
          : <MessageCircle className="w-6 h-6" />
        }
      </button>
    </div>
  )
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function HomeScreen({
  user, greeting, faqs, onOrders, onFAQ, onContact, onFAQItem
}: {
  user: { name: string } | null
  greeting: string
  faqs: FAQ[]
  onOrders: () => void
  onFAQ: () => void
  onContact: () => void
  onFAQItem: (id: string) => void
}) {
  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Greeting */}
      <div className="bg-muted/50 rounded-xl p-4">
        <p className="font-semibold text-sm mb-1">
          {user ? `Hi, ${user.name}! 👋` : "Hi there! 👋"}
        </p>
        <p className="text-sm text-muted-foreground">{greeting}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {user ? (
          <button
            onClick={onOrders}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-colors text-left group"
          >
            <Package className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Track my orders</p>
              <p className="text-xs text-muted-foreground">See status of your recent orders</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <a
            href="/auth/login?next=/account"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-colors text-left group"
          >
            <Package className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sign in to track orders</p>
              <p className="text-xs text-muted-foreground">View your order history & status</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}

        {faqs.length > 0 && (
          <button
            onClick={onFAQ}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-colors text-left group"
          >
            <HelpCircle className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">FAQ</p>
              <p className="text-xs text-muted-foreground">{faqs.length} question{faqs.length !== 1 ? "s" : ""}</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        <button
          onClick={onContact}
          className="flex items-center gap-3 px-4 py-3 bg-white border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-colors text-left group"
        >
          <Mail className="w-5 h-5 text-accent shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Contact seller</p>
            <p className="text-xs text-muted-foreground">Send us a message</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Quick FAQs */}
      {faqs.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Quick answers</p>
          <div className="flex flex-col gap-1">
            {faqs.slice(0, 3).map(faq => (
              <button
                key={faq.id}
                onClick={() => onFAQItem(faq.id)}
                className="text-left text-sm px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OrdersScreen({
  orders, loaded, onSelect
}: {
  orders: Order[]
  loaded: boolean
  onSelect: (order: Order) => void
}) {
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <Package className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No orders found.</p>
        <a href="/account" className="text-sm text-accent hover:underline">Go to My Account</a>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-2">
      {orders.map(order => {
        const statusInfo = order.customer_status ? STATUS_LABELS[order.customer_status] : null
        const firstItem = order.order_items?.[0]
        return (
          <button
            key={order.id}
            onClick={() => onSelect(order)}
            className="flex items-center gap-3 px-3 py-3 bg-white border border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-colors text-left w-full group"
          >
            {firstItem?.image_url && (
              <img src={firstItem.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{order.order_number}</p>
              <p className="text-xs text-muted-foreground truncate">
                {order.order_items.map(i => i.title).join(", ")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {statusInfo ? (
                <span className="text-xs">{statusInfo.emoji} {statusInfo.label}</span>
              ) : (
                <span className="text-xs text-muted-foreground">Processing</span>
              )}
            </div>
          </button>
        )
      })}
      <a href="/account" className="text-xs text-center text-accent hover:underline mt-1">
        View all orders →
      </a>
    </div>
  )
}

function OrderDetailScreen({ order }: { order: Order }) {
  const currentStep = order.customer_status
    ? STATUS_STEPS.indexOf(order.customer_status)
    : -1

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Status tracker */}
      <div className="bg-muted/30 rounded-xl p-4">
        <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wide">Order Status</p>
        <div className="flex flex-col gap-3">
          {STATUS_STEPS.map((key, i) => {
            const info = STATUS_LABELS[key]
            const done = currentStep >= i
            const current = currentStep === i
            return (
              <div key={key} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 transition-colors ${
                  done ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {done ? "✓" : i + 1}
                </div>
                <span className={`text-sm ${current ? "font-semibold text-foreground" : done ? "text-foreground" : "text-muted-foreground"}`}>
                  {info.emoji} {info.label}
                  {current && <span className="ml-2 text-xs text-accent font-normal">← Current</span>}
                </span>
              </div>
            )
          })}
          {currentStep < 0 && (
            <p className="text-sm text-muted-foreground">⏳ Your order is being processed.</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Items</p>
        <div className="flex flex-col gap-2">
          {order.order_items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.image_url && (
                <img src={item.image_url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
              )}
              <p className="text-sm flex-1 min-w-0 truncate">{item.quantity}× {item.title}</p>
            </div>
          ))}
        </div>
      </div>

      <a
        href={`/account/orders/${order.id}`}
        className="text-xs text-center text-accent hover:underline"
      >
        View full order details →
      </a>
    </div>
  )
}

function FAQScreen({ faqs, openId }: { faqs: FAQ[]; openId?: string }) {
  const [expanded, setExpanded] = useState<string | null>(openId ?? null)

  return (
    <div className="p-4 flex flex-col gap-2">
      {faqs.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No FAQs yet.</p>
      )}
      {faqs.map(faq => (
        <div key={faq.id} className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-2 hover:bg-muted/30 transition-colors"
          >
            <span className="text-sm font-medium">{faq.question}</span>
            <span className={`text-muted-foreground text-lg leading-none transition-transform ${expanded === faq.id ? "rotate-45" : ""}`}>+</span>
          </button>
          {expanded === faq.id && (
            <div className="px-4 pb-4 pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ContactScreen({
  user,
  onSent,
}: {
  user: { email: string; name: string } | null
  onSent: () => void
}) {
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setError(null)
    const res = await fetch("/api/chat/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    })
    if (res.ok) {
      onSent()
    } else {
      setError("Failed to send. Please try again.")
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSend} className="p-4 flex flex-col gap-3">
      {!user && (
        <>
          <div>
            <label className="block text-xs font-medium mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </>
      )}
      {user && (
        <div className="bg-muted/40 rounded-lg px-3 py-2 text-sm text-muted-foreground">
          Sending as <span className="font-medium text-foreground">{user.email}</span>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium mb-1">Message *</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={4}
          placeholder="How can we help you?"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {sending ? "Sending…" : "Send Message"}
      </button>
    </form>
  )
}
