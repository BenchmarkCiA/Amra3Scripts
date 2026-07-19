"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical, Mail, Check } from "lucide-react"

interface FAQ { id: string; question: string; answer: string }
interface ChatSettings {
  enabled: boolean
  position: "bottom-right" | "bottom-left"
  greeting: string
}
interface ContactMessage {
  id: string
  name: string | null
  email: string
  message: string
  is_read: boolean
  created_at: string
}

export default function ChatAdminPanel({
  initialSettings,
  initialFaqs,
  initialMessages,
}: {
  initialSettings: ChatSettings
  initialFaqs: FAQ[]
  initialMessages: ContactMessage[]
}) {
  const [settings, setSettings] = useState<ChatSettings>(initialSettings)
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs)
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages)

  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [editingFaq, setEditingFaq] = useState<string | null>(null)

  const [savingSettings, setSavingSettings] = useState(false)
  const [savedSettings, setSavedSettings] = useState(false)
  const [savingFaqs, setSavingFaqs] = useState(false)
  const [savedFaqs, setSavedFaqs] = useState(false)

  const [tab, setTab] = useState<"settings" | "messages">("settings")

  const saveSettings = async () => {
    setSavingSettings(true)
    setSavedSettings(false)
    await fetch("/api/admin/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "settings", value: settings }),
    })
    setSavingSettings(false)
    setSavedSettings(true)
    setTimeout(() => setSavedSettings(false), 2000)
  }

  const saveFaqs = async (updated: FAQ[]) => {
    setSavingFaqs(true)
    setSavedFaqs(false)
    await fetch("/api/admin/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "faqs", value: updated }),
    })
    setSavingFaqs(false)
    setSavedFaqs(true)
    setTimeout(() => setSavedFaqs(false), 2000)
  }

  const addFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return
    const updated = [...faqs, { id: crypto.randomUUID(), question: newQuestion.trim(), answer: newAnswer.trim() }]
    setFaqs(updated)
    setNewQuestion("")
    setNewAnswer("")
    saveFaqs(updated)
  }

  const deleteFaq = (id: string) => {
    const updated = faqs.filter(f => f.id !== id)
    setFaqs(updated)
    saveFaqs(updated)
  }

  const updateFaq = (id: string, field: "question" | "answer", value: string) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const saveFaqEdit = (id: string) => {
    setEditingFaq(null)
    saveFaqs(faqs)
  }

  const markRead = async (id: string) => {
    await fetch("/api/admin/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "mark_read", id }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

  const unread = messages.filter(m => !m.is_read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Chat Widget</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure and manage your support chat.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${settings.enabled ? "bg-success" : "bg-muted-foreground/40"}`} />
          <span className="text-sm font-medium">{settings.enabled ? "Active" : "Disabled"}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
        {[
          { id: "settings" as const, label: "Settings & FAQ" },
          { id: "messages" as const, label: `Messages${unread > 0 ? ` (${unread})` : ""}` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "settings" && (
        <div className="flex flex-col gap-6 max-w-2xl">
          {/* Widget settings */}
          <section className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
            <h2 className="font-semibold">Widget Settings</h2>

            {/* Enable/disable */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Enable chat widget</p>
                <p className="text-xs text-muted-foreground">Show the chat bubble on all store pages</p>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, enabled: !s.enabled }))}
                className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
                  settings.enabled ? "bg-accent" : "bg-muted"
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.enabled ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </div>

            {/* Position */}
            <div>
              <p className="font-medium text-sm mb-2">Position</p>
              <div className="flex gap-3">
                {(["bottom-right", "bottom-left"] as const).map(pos => (
                  <button
                    key={pos}
                    onClick={() => setSettings(s => ({ ...s, position: pos }))}
                    className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      settings.position === pos
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {pos === "bottom-right" ? "↘ Bottom right" : "↙ Bottom left"}
                  </button>
                ))}
              </div>
            </div>

            {/* Greeting */}
            <div>
              <label className="block text-sm font-medium mb-1">Greeting message</label>
              <input
                type="text"
                value={settings.greeting}
                onChange={e => setSettings(s => ({ ...s, greeting: e.target.value }))}
                placeholder="Hi there! How can I help you?"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-xs text-muted-foreground mt-1">Shown at the top of the chat widget.</p>
            </div>

            <button
              onClick={saveSettings}
              disabled={savingSettings}
              className="self-start bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {savingSettings ? "Saving…" : savedSettings ? "✓ Saved" : "Save Settings"}
            </button>
          </section>

          {/* FAQ editor */}
          <section className="bg-white rounded-xl border border-border p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">FAQ Questions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">These appear in the chat widget for guests and logged-in users.</p>
              </div>
              {savedFaqs && <span className="text-xs text-success font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
            </div>

            {/* Existing FAQs */}
            {faqs.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No FAQ entries yet. Add one below.</p>
            )}
            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => (
                <div key={faq.id} className="border border-border rounded-xl p-4 flex gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-1" />
                  <div className="flex-1 flex flex-col gap-2">
                    {editingFaq === faq.id ? (
                      <>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={e => updateFaq(faq.id, "question", e.target.value)}
                          className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                          placeholder="Question"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={e => updateFaq(faq.id, "answer", e.target.value)}
                          rows={2}
                          className="border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                          placeholder="Answer"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveFaqEdit(faq.id)} className="text-xs text-accent hover:underline font-medium">Save</button>
                          <button onClick={() => setEditingFaq(null)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">{faq.question}</p>
                        <p className="text-xs text-muted-foreground">{faq.answer}</p>
                        <button onClick={() => setEditingFaq(faq.id)} className="self-start text-xs text-accent hover:underline">Edit</button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => deleteFaq(faq.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new FAQ */}
            <div className="border border-dashed border-border rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add new question</p>
              <input
                type="text"
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                placeholder="Question"
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <textarea
                value={newAnswer}
                onChange={e => setNewAnswer(e.target.value)}
                rows={2}
                placeholder="Answer"
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
              <button
                onClick={addFaq}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
                className="flex items-center gap-2 self-start bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>
          </section>
        </div>
      )}

      {tab === "messages" && (
        <div className="max-w-2xl flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="bg-white rounded-xl border border-border p-12 text-center text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No messages yet.</p>
            </div>
          )}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border p-5 transition-colors ${
                msg.is_read ? "border-border" : "border-accent/50 bg-accent/5"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-medium text-sm">{msg.name ?? msg.email}</p>
                  {msg.name && <p className="text-xs text-muted-foreground">{msg.email}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {!msg.is_read && (
                    <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-medium">New</span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
              {!msg.is_read && (
                <button
                  onClick={() => markRead(msg.id)}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
