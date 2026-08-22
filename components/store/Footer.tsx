import { ReopenConsentButton } from "@/components/consent/ReopenConsentButton"

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-3">Store</h3>
          <p className="text-primary-foreground/70 text-sm">
            Premium products delivered to your door.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><a href="/products" className="hover:text-primary-foreground transition-colors">All Products</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><a href="mailto:support@store.com" className="hover:text-primary-foreground transition-colors">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 text-center py-4 text-xs text-primary-foreground/50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4">
        <span>© {new Date().getFullYear()} Store. All rights reserved.</span>
        <a href="/privacy-policy" className="hover:text-primary-foreground/80 transition-colors">Privacy Policy</a>
        <a href="/cookie-policy" className="hover:text-primary-foreground/80 transition-colors">Cookie Policy</a>
        <a href="/your-privacy-choices" className="hover:text-primary-foreground/80 transition-colors">Your Privacy Choices</a>
        <a href="/accessibility" className="hover:text-primary-foreground/80 transition-colors">Accessibility</a>
        <ReopenConsentButton label="Manage Cookies" />
      </div>
    </footer>
  )
}
