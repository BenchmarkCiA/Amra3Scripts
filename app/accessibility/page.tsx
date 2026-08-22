import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Our commitment to WCAG 2.1 Level AA accessibility and how to reach us with concerns.",
}

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="max-w-3xl mx-auto px-4 py-16" tabIndex={-1}>
      <h1 className="text-3xl font-bold mb-6">Accessibility Statement</h1>

      <p className="text-muted-foreground mb-8 leading-relaxed">
        We are committed to making this website accessible to everyone. We aim to conform to the{" "}
        <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standard.
      </p>

      <section aria-labelledby="measures-heading" className="mb-10">
        <h2 id="measures-heading" className="text-xl font-semibold mb-3">Measures we have taken</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm leading-relaxed">
          <li>All interactive elements are keyboard-accessible with a visible focus indicator.</li>
          <li>Cart drawer, consent banners, and modals implement focus trapping and dismiss on Escape.</li>
          <li>A &ldquo;Skip to main content&rdquo; link appears at the top of every page for keyboard users.</li>
          <li>Product images include descriptive alternative text.</li>
          <li>Product variant pickers use radio-group semantics with visible selected state.</li>
          <li>Form inputs have programmatically associated labels; errors are announced via live regions.</li>
          <li>Cart changes are announced to screen readers via <code>aria-live</code> regions.</li>
          <li>Page titles are unique and descriptive on every route.</li>
          <li>The site respects the <code>prefers-reduced-motion</code> media query.</li>
          <li>Minimum touch target size of 44 × 44 CSS pixels on interactive elements.</li>
          <li>Text contrast meets the 4.5:1 ratio required by WCAG 2.1 SC 1.4.3 for normal text.</li>
        </ul>
      </section>

      <section aria-labelledby="limitations-heading" className="mb-10">
        <h2 id="limitations-heading" className="text-xl font-semibold mb-3">Known limitations</h2>
        <ul className="list-disc pl-6 space-y-2 text-sm leading-relaxed">
          <li>
            <strong>Stripe Checkout (hosted):</strong> The payment page is served by Stripe and is outside
            our direct control. Stripe publishes their own{" "}
            <a
              href="https://stripe.com/accessibility"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              accessibility statement
            </a>
            .
          </li>
          <li>
            <strong>Country storefront pages</strong> currently use a custom layout that does not yet
            include a skip link. We are actively working to bring these pages to full AA conformance.
          </li>
          <li>
            User-generated review content (product reviews) is not currently moderated for accessibility of
            included links or images.
          </li>
        </ul>
      </section>

      <section aria-labelledby="feedback-heading" className="mb-10">
        <h2 id="feedback-heading" className="text-xl font-semibold mb-3">Feedback and contact</h2>
        <p className="text-sm leading-relaxed">
          We welcome your feedback on the accessibility of this site. If you encounter a barrier or need
          content in an alternative format, please contact us:
        </p>
        <address className="mt-3 not-italic text-sm">
          <a href="mailto:support@store.com" className="underline text-accent">
            support@store.com
          </a>
        </address>
        <p className="text-sm mt-3 leading-relaxed">
          We aim to respond to accessibility feedback within 3 business days.
        </p>
      </section>

      <section aria-labelledby="standard-heading">
        <h2 id="standard-heading" className="text-xl font-semibold mb-3">Technical standard</h2>
        <p className="text-sm leading-relaxed">
          This site targets{" "}
          <a
            href="https://www.w3.org/TR/WCAG21/"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            WCAG 2.1 Level AA
          </a>
          . This statement was last reviewed on{" "}
          <time dateTime="2026-08-22">22 August 2026</time>.
        </p>
      </section>
    </main>
  )
}
