import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How OTZMA uses cookies and similar technologies.",
}

// TODO: LAWYER REVIEW — placeholder template, requires legal review before publishing.

export default function CookiePolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-8 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <strong>Notice:</strong> Placeholder template. <strong>TODO: LAWYER REVIEW before publishing.</strong>
      </div>

      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-muted-foreground text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <Section title="What are cookies?">
        <p>Cookies are small text files stored in your browser. We also use similar technologies such as local storage and pixel tags.</p>
      </Section>

      <Section title="Cookies we use">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted">
              <Th>Name</Th><Th>Category</Th><Th>Purpose</Th><Th>Duration</Th>
            </tr>
          </thead>
          <tbody>
            <Tr name="otzma_consent" cat="Necessary" purpose="Stores your cookie consent choices" dur="13 months" />
            <Tr name="otzma_cart" cat="Necessary" purpose="Persists your shopping cart" dur="Session / 30 days" />
            <Tr name="__stripe_*" cat="Necessary" purpose="Fraud prevention by Stripe" dur="Session" />
            <Tr name="_ga, _ga_*" cat="Analytics" purpose="Google Analytics 4 — aggregate site usage" dur="Up to 2 years" />
            <Tr name="[TODO]" cat="Marketing" purpose="[TODO: list advertising pixels if added]" dur="[TODO]" />
          </tbody>
        </table>
      </Section>

      <Section title="Your choices">
        <p>You can manage your preferences at any time via the <a href="/your-privacy-choices" className="underline">Your Privacy Choices</a> page or by clicking &ldquo;Your Privacy Choices&rdquo; in our site footer. You can also configure your browser to block or delete cookies, but this may affect site functionality.</p>
        <p className="mt-2">If your browser sends a <strong>Global Privacy Control</strong> (GPC) signal, we treat it as an opt-out of all non-essential cookies automatically.</p>
      </Section>

      <Section title="Third-party cookies">
        <p><strong>[TODO: list all third-party domains that set cookies and link to their privacy policies]</strong></p>
      </Section>

      <Section title="Changes to this policy">
        <p>We will notify you of material changes by re-prompting for consent where required by law.</p>
      </Section>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-2 text-sm">{children}</div>
    </section>
  )
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left p-2 border border-border font-semibold">{children}</th>
}
function Tr({ name, cat, purpose, dur }: { name: string; cat: string; purpose: string; dur: string }) {
  return (
    <tr>
      <td className="p-2 border border-border font-mono">{name}</td>
      <td className="p-2 border border-border">{cat}</td>
      <td className="p-2 border border-border">{purpose}</td>
      <td className="p-2 border border-border whitespace-nowrap">{dur}</td>
    </tr>
  )
}
