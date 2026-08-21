import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How OTZMA collects, uses, and protects your personal information.",
}

// TODO: LAWYER REVIEW — All policy text below is a placeholder template.
// Do not publish without review by a qualified privacy attorney.

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-8 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <strong>Notice:</strong> This document is a placeholder template.{" "}
        <strong>TODO: LAWYER REVIEW required before publishing.</strong>
      </div>

      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <Section title="1. Who we are">
        <p>OTZMA (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the e-commerce store at this domain. <strong>[TODO: insert legal entity name, registered address, and contact email]</strong></p>
      </Section>

      <Section title="2. What personal data we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>Name, shipping address, email, phone number (when you place an order)</li>
          <li>Payment information (processed by Stripe — we never store raw card details)</li>
          <li>Browsing behaviour and device identifiers (subject to your cookie consent)</li>
          <li>Communications you send us (support emails)</li>
        </ul>
        <p className="mt-3">We do <strong>not</strong> collect precise geolocation, biometric data, health data, or any other sensitive category. We do not knowingly collect data from anyone under 13.</p>
      </Section>

      <Section title="3. Legal basis for processing (UK / EU visitors)">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Contract:</strong> processing your order, shipping, and customer support.</li>
          <li><strong>Legitimate interests:</strong> fraud prevention, site security.</li>
          <li><strong>Consent:</strong> analytics and marketing cookies (you can withdraw at any time).</li>
          <li><strong>Legal obligation:</strong> tax and accounting records.</li>
        </ul>
      </Section>

      <Section title="4. How we use your data">
        <p><strong>[TODO: list every processing purpose and link to a legal basis]</strong></p>
      </Section>

      <Section title="5. Third-party sharing">
        <p>We share data with: Stripe (payments), our shipping carrier(s), and — only with your consent — analytics providers. We do <strong>not</strong> sell personal data. <strong>[TODO: list all sub-processors]</strong></p>
      </Section>

      <Section title="6. Your rights">
        <p>Depending on your location you may have rights to access, correct, delete, port, or restrict processing of your data, and to object to targeted advertising. Submit a request at <a href="/your-privacy-choices" className="underline">Your Privacy Choices</a>. We will respond within 30 days (UK/EU: 1 month).</p>
      </Section>

      <Section title="7. Global Privacy Control">
        <p>We honour the Global Privacy Control (GPC) signal. If your browser sends GPC, we automatically treat it as an opt-out of sale and sharing of personal data, and do not fire advertising or analytics scripts.</p>
      </Section>

      <Section title="8. Cookies">
        <p>See our <a href="/cookie-policy" className="underline">Cookie Policy</a>.</p>
      </Section>

      <Section title="9. Data retention">
        <p><strong>[TODO: specify retention periods per category]</strong> Order records are retained for 7 years for tax purposes. Consent logs are retained for 3 years.</p>
      </Section>

      <Section title="10. Contact & complaints">
        <p><strong>[TODO: insert DPO/privacy contact email]</strong>. UK/EU residents may lodge a complaint with their national supervisory authority (ICO in the UK, relevant DPA in the EU).</p>
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
