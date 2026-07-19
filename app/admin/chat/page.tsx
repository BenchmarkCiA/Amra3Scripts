export const dynamic = "force-dynamic"

import { createAdminClient } from "@/lib/supabase/admin"
import ChatAdminPanel from "@/components/admin/ChatAdminPanel"

export default async function AdminChatPage() {
  const supabase = createAdminClient()

  const [{ data: settingsRow }, { data: faqsRow }, { data: messages }] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "chat_settings").single(),
    supabase.from("site_settings").select("value").eq("key", "chat_faqs").single(),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
  ])

  return (
    <ChatAdminPanel
      initialSettings={settingsRow?.value ?? { enabled: false, position: "bottom-right", greeting: "Hi there! How can I help you?" }}
      initialFaqs={faqsRow?.value ?? []}
      initialMessages={messages ?? []}
    />
  )
}
