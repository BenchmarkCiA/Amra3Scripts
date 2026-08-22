import Header from "./Header"
import Footer from "./Footer"

export default function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  )
}
