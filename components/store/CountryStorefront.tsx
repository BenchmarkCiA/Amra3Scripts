"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { type Country, formatCountryPrice, COUNTRIES } from "@/lib/countries"
import type { Product } from "@/types"
import SocialIcons, { type SocialLinks } from "@/components/store/SocialIcons"
import CartDrawer from "@/components/store/CartDrawer"
import { useCart } from "@/hooks/useCart"

interface ContentOverrides {
  announcement?: string
  heroH1a?: string
  heroH1b?: string
  heroLead?: string
  heroCta1?: string
  heroCta2?: string
  collectionTitle?: string
  stat1Label?: string
  stat1Sub?: string
  stat2Label?: string
  stat2Sub?: string
  stat3Label?: string
  stat3Sub?: string
  customizerH2a?: string
  customizerH2b?: string
  customizerLead?: string
  customizerLabel?: string
  footerBadge?: string
}

interface StoreCategory {
  id: string
  name: string
  slug: string
}

interface Props {
  country: Country
  products: Product[]
  heroImageUrl?: string | null
  contentOverrides?: ContentOverrides | null
  socialLinks?: SocialLinks | null
  categories?: StoreCategory[]
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function getLowestPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) return 0
  return Math.min(...product.variants.map((v) => v.price))
}

function Flag({ code, width, height }: { code: string; width: number; height: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt=""
      width={width}
      height={height}
      style={{ display: "block", objectFit: "cover", borderRadius: 3 }}
    />
  )
}

export default function CountryStorefront({ country, products, heroImageUrl, contentOverrides, socialLinks, categories = [] }: Props) {
  const router = useRouter()
  const { itemCount, openCart } = useCart()
  const cartCount = itemCount()

  const isHe = country.code === "il"
  const dir = isHe ? ("rtl" as const) : ("ltr" as const)
  const accentHex = country.accent
  const glowColor = hexToRgba(accentHex, 0.22)
  const displayName = isHe ? country.nameHe : country.nameEn

  const t = isHe
    ? {
        announcement: `כיתוב אישי על כל פריט · משלוח ל${country.shipLabel} · החזרה חינם 30 יום`,
        navClothing: "הלבשה",
        navGear: "ציוד",
        navCustomize: "התאמה אישית",
        switchSuffix: "· החלף",
        accountLabel: "חשבון",
        heroEyebrow: `${country.en} COLLECTION`,
        heroH1a: "השורשים שלך.",
        heroH1b: "בלי התנצלות.",
        heroLead: `קולקציית ${country.nameHe} — הלבשה וציוד שנושאים את הכיתוב שאתה בוחר. הזהות שלך, בגוף ראשון.`,
        heroCta1: "לכל הקולקציה",
        heroCta2: "עיצוב את שלך",
        stats: [
          { label: "+2,400", sub: "לקוחות מרוצים" },
          { label: "100%", sub: "כיתוב אישי" },
          { label: "30 יום", sub: "החזרה חינם" },
        ],
        campaignPlaceholder: "תמונת קמפיין במקום זה",
        collectionEyebrow: "THE COLLECTION",
        collectionTitle: `הקולקציה של ${country.nameHe}`,
        filterChips: [
          { value: "all", label: "הכל" },
          { value: "הלבשה", label: "הלבשה" },
          { value: "ציוד", label: "ציוד" },
        ],
        noProducts: "אין מוצרים זמינים כרגע",
        personalBadge: "כיתוב אישי",
        addToCart: "הוסף לעגלה",
        customizerEyebrow: "MAKE IT YOURS",
        customizerH2a: "הכיתוב שלך.",
        customizerH2b: "העוצמה שלך.",
        customizerLead:
          "הוסף את השם שלך, שנה משמעותית, ציטוט מהלב — על כל פריט בקולקציה. זו הזהות שלך.",
        customizerLabel: "הכיתוב שלך",
        defaultText: "השם שלך",
        previewLabel: "TEE · PREVIEW",
        previewCaption: "תצוגה מקדימית · אזור ההדפסה",
        footerBadge: "שם ולוגו זמניים",
        footerViewing: `גולש מ${country.shipLabel} · ${country.currency.name}`,
        footerSwitch: "החלף מדינה",
      }
    : {
        announcement: `Personal text on every item · Shipping to ${country.shipLabelEn} · Free returns 30 days`,
        navClothing: "Clothing",
        navGear: "Gear",
        navCustomize: "Customize",
        switchSuffix: "· Switch",
        accountLabel: "Account",
        heroEyebrow: `${country.en} COLLECTION`,
        heroH1a: "Your roots.",
        heroH1b: "No apologies.",
        heroLead: `The ${country.nameEn} collection — apparel and gear carrying the text you choose. Your identity, in the first person.`,
        heroCta1: "See full collection",
        heroCta2: "Design yours",
        stats: [
          { label: "+2,400", sub: "happy customers" },
          { label: "100%", sub: "personal text" },
          { label: "30 days", sub: "free returns" },
        ],
        campaignPlaceholder: "Campaign image here",
        collectionEyebrow: "THE COLLECTION",
        collectionTitle: `The ${country.nameEn} Collection`,
        filterChips: [
          { value: "all", label: "All" },
          { value: "clothing", label: "Clothing" },
          { value: "gear", label: "Gear" },
        ],
        noProducts: "No products available right now",
        personalBadge: "Personal text",
        addToCart: "Add to cart",
        customizerEyebrow: "MAKE IT YOURS",
        customizerH2a: "Your text.",
        customizerH2b: "Your strength.",
        customizerLead:
          "Add your name, a meaningful year, a quote from the heart — on every item in the collection. This is your identity.",
        customizerLabel: "Your text",
        defaultText: "Your Name",
        previewLabel: "TEE · PREVIEW",
        previewCaption: "Preview · Print area",
        footerBadge: "Placeholder name & logo",
        footerViewing: `Browsing from ${country.nameEn} · ${country.currency.nameEn}`,
        footerSwitch: "Switch country",
      }

  // Merge stored overrides over code defaults (empty string = use default)
  const overrides = Object.fromEntries(
    Object.entries(contentOverrides ?? {}).filter(([, v]) => v && (v as string).trim())
  )
  const c = { ...t, ...overrides }

  // Build overridable stats from flat override fields or fall back to defaults
  const cStats = [
    { label: (c as ContentOverrides).stat1Label || t.stats[0].label, sub: (c as ContentOverrides).stat1Sub || t.stats[0].sub },
    { label: (c as ContentOverrides).stat2Label || t.stats[1].label, sub: (c as ContentOverrides).stat2Sub || t.stats[1].sub },
    { label: (c as ContentOverrides).stat3Label || t.stats[2].label, sub: (c as ContentOverrides).stat3Sub || t.stats[2].sub },
  ]

  // Build filter chips from database categories; fall back to hardcoded if none exist
  const dynamicChips = categories.length > 0
    ? [
        { value: "all", label: isHe ? "הכל" : "All" },
        ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
      ]
    : c.filterChips

  const [filter, setFilter] = useState<string>("all")
  const [customText, setCustomText] = useState(t.defaultText)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pickerOpen) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [pickerOpen])

  function goToCountry(code: string) {
    localStorage.setItem("otzma_country", code)
    setPickerOpen(false)
    router.push(`/${code}`)
  }

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter(
          (p) =>
            p.category?.name?.toLowerCase() === filter.toLowerCase() ||
            p.category?.slug?.toLowerCase() === filter.toLowerCase()
        )

  return (
    <div
      dir={dir}
      style={{
        fontFamily: "var(--font-heebo), Arial, sans-serif",
        background: "#f4f1ea",
        color: "#14161a",
        minHeight: "100vh",
        ["--accent" as string]: accentHex,
        ["--accent-ink" as string]: "#fff",
        ["--accent-glow" as string]: glowColor,
      }}
    >
      {/* ── Announcement bar ── */}
      <div
        style={{
          background: accentHex,
          color: "#fff",
          fontSize: 13,
          fontWeight: 500,
          padding: "9px 16px",
          textAlign: "center",
        }}
      >
        {c.announcement}
      </div>

      {/* ── Sticky header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(244,241,234,0.86)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(17,19,22,0.1)",
          padding: "16px clamp(20px,4vw,56px)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Brand lockup */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: isHe ? "flex-end" : "flex-start", gap: 1 }}>
          <span
            style={{
              fontFamily: "var(--font-heebo), Arial, sans-serif",
              fontWeight: 900,
              fontSize: 21,
              lineHeight: 1,
              color: "#14161a",
            }}
          >
            עוצמה
          </span>
          <span
            style={{
              fontFamily: "var(--font-oswald), Arial, sans-serif",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: "0.28em",
              color: "rgba(17,19,22,0.45)",
            }}
          >
            OTZMA
          </span>
        </div>

        {/* Nav */}
        <nav
          style={{
            display: "flex",
            gap: 22,
            alignItems: "center",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <a href="#collection" style={{ color: "#14161a", textDecoration: "none" }}>
            {t.navClothing}
          </a>
          <a href="#collection" style={{ color: "#14161a", textDecoration: "none" }}>
            {t.navGear}
          </a>
          <a
            href="#customizer"
            style={{ color: accentHex, textDecoration: "none", fontWeight: 600 }}
          >
            {t.navCustomize}
          </a>
        </nav>

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Country picker */}
          <div ref={pickerRef} style={{ position: "relative" }}>
            <button
              onClick={() => setPickerOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                border: "1px solid rgba(17,19,22,0.2)",
                borderRadius: 9999,
                padding: "6px 13px",
                background: pickerOpen ? "rgba(17,19,22,0.06)" : "transparent",
                cursor: "pointer",
                fontSize: 13,
                color: "#14161a",
                fontFamily: "var(--font-heebo), Arial, sans-serif",
              }}
            >
              <Flag code={country.code} width={22} height={15} />
              <span>{displayName}</span>
              <span style={{ color: "rgba(17,19,22,0.45)" }}>{t.switchSuffix}</span>
            </button>

            {pickerOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  [isHe ? "left" : "right"]: 0,
                  background: "#fff",
                  border: "1px solid rgba(17,19,22,0.12)",
                  borderRadius: 10,
                  boxShadow: "0 8px 32px rgba(17,19,22,0.14)",
                  minWidth: 200,
                  zIndex: 100,
                  overflow: "hidden",
                  padding: "6px 0",
                }}
              >
                {Object.values(COUNTRIES).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => goToCountry(c.code)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 16px",
                      background: c.code === country.code ? "rgba(17,19,22,0.05)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 14,
                      color: "#14161a",
                      fontFamily: "var(--font-heebo), Arial, sans-serif",
                      textAlign: isHe ? "right" : "left",
                      fontWeight: c.code === country.code ? 600 : 400,
                    }}
                  >
                    <Flag code={c.code} width={24} height={16} />
                    <span>{c.nameEn}</span>
                    {c.code === country.code && (
                      <span style={{ marginInlineStart: "auto", fontSize: 11, color: "rgba(17,19,22,0.4)" }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart icon */}
          <button
            onClick={openCart}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#14161a",
              color: "#f4f1ea",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            aria-label="Cart"
          >
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: accentHex,
                  color: "#fff",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => router.push("/account")}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(17,19,22,0.08)",
              color: "#14161a",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={t.accountLabel}
          >
            {isHe ? "א" : "A"}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          background: "#14161a",
          color: "#f4f1ea",
          minHeight: 540,
        }}
      >
        <div
          style={{
            flex: "1.05 1 340px",
            minWidth: 340,
            padding: "clamp(40px,6vw,88px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Flag code={country.code} width={36} height={24} />
            <span
              style={{
                fontFamily: "var(--font-oswald), Arial, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.26em",
                color: "rgba(244,241,234,0.55)",
                textTransform: "uppercase",
              }}
            >
              {t.heroEyebrow}
            </span>
          </div>

          {/* H1 */}
          <h1
            style={{
              fontFamily: "var(--font-heebo), Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(40px,5.6vw,82px)",
              lineHeight: 0.95,
              maxWidth: "16ch",
              margin: 0,
              color: "#f4f1ea",
            }}
          >
            {c.heroH1a}{" "}
            <span style={{ display: "block" }}>{c.heroH1b}</span>
          </h1>

          {/* Lead */}
          <p
            style={{
              color: "rgba(244,241,234,0.6)",
              maxWidth: "42ch",
              lineHeight: 1.55,
              margin: 0,
              fontSize: "clamp(15px,1.3vw,18px)",
            }}
          >
            {c.heroLead}
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="#collection"
              style={{
                background: accentHex,
                color: "#fff",
                padding: "13px 26px",
                borderRadius: 3,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                fontFamily: "var(--font-heebo), Arial, sans-serif",
                display: "inline-block",
              }}
            >
              {c.heroCta1}
            </a>
            <a
              href="#customizer"
              style={{
                border: "1px solid rgba(244,241,234,0.28)",
                color: "#f4f1ea",
                padding: "13px 26px",
                borderRadius: 3,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                fontFamily: "var(--font-heebo), Arial, sans-serif",
                display: "inline-block",
                background: "transparent",
              }}
            >
              {c.heroCta2}
            </a>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
              borderTop: "1px solid rgba(244,241,234,0.15)",
              paddingTop: 20,
              marginTop: 4,
            }}
          >
            {cStats.map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: "var(--font-heebo), Arial, sans-serif",
                    fontWeight: 800,
                    fontSize: 22,
                    color: "#f4f1ea",
                  }}
                >
                  {stat.label}
                </div>
                <div style={{ fontSize: 13, color: "rgba(244,241,234,0.55)", marginTop: 2 }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign image */}
        <div
          style={{
            flex: "1 1 340px",
            minWidth: 340,
            position: "relative",
            background: heroImageUrl
              ? "#14161a"
              : `repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 2px, transparent 2px 16px)`,
            minHeight: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt=""
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(180deg, transparent, ${glowColor})`,
                  pointerEvents: "none",
                }}
              />
              <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-oswald), Arial, sans-serif",
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "0.26em",
                    color: "rgba(244,241,234,0.35)",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  LIFESTYLE · CAMPAIGN
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-heebo), Arial, sans-serif",
                    fontSize: 15,
                    color: "rgba(244,241,234,0.25)",
                  }}
                >
                  {t.campaignPlaceholder}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Product collection ── */}
      <section
        id="collection"
        style={{
          background: "#f4f1ea",
          padding: "clamp(48px,6vw,88px) clamp(20px,4vw,56px)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-oswald), Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.3em",
                  color: accentHex,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {t.collectionEyebrow}
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-heebo), Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(26px,3vw,40px)",
                  margin: 0,
                  color: "#14161a",
                }}
              >
                {c.collectionTitle}
              </h2>
            </div>

            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {dynamicChips.map((chip) => {
                const active = filter === chip.value
                return (
                  <button
                    key={chip.value}
                    onClick={() => setFilter(chip.value)}
                    style={{
                      borderRadius: 9999,
                      padding: "7px 18px",
                      fontSize: 14,
                      fontWeight: 500,
                      fontFamily: "var(--font-heebo), Arial, sans-serif",
                      cursor: "pointer",
                      border: active ? "none" : "1px solid rgba(17,19,22,0.25)",
                      background: active ? "#14161a" : "transparent",
                      color: active ? "#fff" : "#14161a",
                      transition: "all 0.15s",
                    }}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Product grid */}
          {filteredProducts.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(17,19,22,0.45)", padding: "40px 0" }}>
              {c.noProducts}
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 18,
              }}
            >
              {filteredProducts.map((product) => {
                const isHovered = hoveredCard === product.id
                const lowestPrice = getLowestPrice(product)
                const firstImage = product.images?.[0]

                return (
                  <div
                    key={product.id}
                    onMouseEnter={() => setHoveredCard(product.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(17,19,22,0.08)",
                      borderRadius: 5,
                      overflow: "hidden",
                      transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                      boxShadow: isHovered
                        ? "0 12px 32px rgba(17,19,22,0.12)"
                        : "0 1px 4px rgba(17,19,22,0.06)",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <a
                      href={`/products/${product.slug}`}
                      style={{ display: "block", textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          aspectRatio: "4/3.4",
                          background: "#efece4",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {firstImage ? (
                          <Image
                            src={firstImage.url}
                            alt={firstImage.alt ?? product.title}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          />
                        ) : (
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "repeating-linear-gradient(135deg, rgba(17,19,22,.04) 0 2px, transparent 2px 16px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-oswald), Arial, sans-serif",
                                fontWeight: 600,
                                fontSize: 13,
                                letterSpacing: "0.22em",
                                color: "rgba(17,19,22,0.25)",
                                textTransform: "uppercase",
                              }}
                            >
                              PRODUCT
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            right: dir === "rtl" ? 10 : "auto",
                            left: dir === "ltr" ? 10 : "auto",
                            background: accentHex,
                            color: "#fff",
                            borderRadius: 9999,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 10px",
                            fontFamily: "var(--font-heebo), Arial, sans-serif",
                          }}
                        >
                          {c.personalBadge}
                        </div>
                      </div>

                      <div style={{ padding: "16px 16px 0" }}>
                        {product.category && (
                          <div
                            style={{
                              fontFamily: "var(--font-oswald), Arial, sans-serif",
                              fontWeight: 500,
                              fontSize: 11,
                              letterSpacing: "0.2em",
                              color: "rgba(17,19,22,0.45)",
                              textTransform: "uppercase",
                              marginBottom: 5,
                            }}
                          >
                            {product.category.name}
                          </div>
                        )}
                        <div
                          style={{
                            fontFamily: "var(--font-heebo), Arial, sans-serif",
                            fontWeight: 800,
                            fontSize: 18,
                            color: "#14161a",
                            marginBottom: 12,
                            lineHeight: 1.2,
                          }}
                        >
                          {product.title}
                        </div>
                      </div>
                    </a>

                    <div style={{ padding: "0 16px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-heebo), Arial, sans-serif",
                            fontWeight: 800,
                            fontSize: 19,
                            color: "#14161a",
                          }}
                        >
                          {lowestPrice > 0 ? formatCountryPrice(lowestPrice, country) : "—"}
                        </span>
                        <a
                          href={`/products/${product.slug}`}
                          style={{
                            background: isHovered ? accentHex : "#14161a",
                            color: "#fff",
                            borderRadius: 3,
                            fontSize: 13,
                            fontWeight: 600,
                            padding: "8px 14px",
                            textDecoration: "none",
                            fontFamily: "var(--font-heebo), Arial, sans-serif",
                            transition: "background 0.15s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.addToCart}
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Customizer ── */}
      <section
        id="customizer"
        style={{
          background: accentHex,
          color: "#fff",
          padding: "clamp(48px,6vw,96px) clamp(20px,4vw,56px)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(32px,5vw,72px)",
            alignItems: "center",
            maxWidth: 1180,
            margin: "0 auto",
          }}
        >
          {/* Controls */}
          <div
            style={{
              flex: "1 1 340px",
              order: isHe ? 2 : 1,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-oswald), Arial, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                textAlign: isHe ? "right" : "left",
              }}
            >
              {c.customizerEyebrow}
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heebo), Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(30px,3.8vw,54px)",
                lineHeight: 1,
                margin: 0,
                textAlign: isHe ? "right" : "left",
              }}
            >
              {c.customizerH2a}{" "}
              <span style={{ display: "block" }}>{c.customizerH2b}</span>
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.55,
                margin: 0,
                textAlign: isHe ? "right" : "left",
                fontSize: "clamp(14px,1.2vw,17px)",
              }}
            >
              {c.customizerLead}
            </p>

            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-heebo), Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 8,
                  textAlign: isHe ? "right" : "left",
                }}
              >
                {c.customizerLabel}
              </label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={22}
                style={{
                  width: "100%",
                  maxWidth: 420,
                  background: "#fff",
                  color: "#14161a",
                  border: "none",
                  borderRadius: 4,
                  padding: "14px 16px",
                  fontSize: 17,
                  fontWeight: 600,
                  fontFamily: "var(--font-heebo), Arial, sans-serif",
                  textAlign: isHe ? "right" : "left",
                  outline: "none",
                  boxSizing: "border-box",
                  display: "block",
                }}
              />
            </div>

            {/* Preset chips */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: isHe ? "flex-end" : "flex-start",
              }}
            >
              {country.presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCustomText(preset)}
                  style={{
                    borderRadius: 9999,
                    padding: "7px 16px",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "var(--font-heebo), Arial, sans-serif",
                    cursor: "pointer",
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div
            style={{
              flex: "1 1 340px",
              order: isHe ? 1 : 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                aspectRatio: "1/1.06",
                background: `repeating-linear-gradient(135deg, rgba(0,0,0,.08) 0 2px, transparent 2px 16px)`,
                borderRadius: 6,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(20px,3vw,36px)",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.18)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1, width: "100%", textAlign: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: "clamp(20px,3vw,32px)",
                  }}
                >
                  <Flag code={country.code} width={22} height={15} />
                  <span
                    style={{
                      fontFamily: "var(--font-oswald), Arial, sans-serif",
                      fontWeight: 500,
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      color: "rgba(255,255,255,0.5)",
                      textTransform: "uppercase",
                    }}
                  >
                    {t.previewLabel}
                  </span>
                </div>

                <div
                  style={{
                    border: "1.5px dashed rgba(255,255,255,0.35)",
                    borderRadius: 4,
                    padding: "clamp(16px,2.5vw,24px)",
                    minHeight: 80,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-heebo), Arial, sans-serif",
                      fontWeight: 900,
                      fontSize: "clamp(26px,4vw,40px)",
                      color: "#fff",
                      textTransform: "uppercase",
                      wordBreak: "break-word",
                      textAlign: "center",
                      lineHeight: 1.1,
                    }}
                  >
                    {customText || t.defaultText}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-oswald), Arial, sans-serif",
                      fontWeight: 500,
                      fontSize: 13,
                      letterSpacing: "0.2em",
                      color: "rgba(255,255,255,0.5)",
                      textTransform: "uppercase",
                    }}
                  >
                    {country.en}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "clamp(16px,2vw,24px)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-heebo), Arial, sans-serif",
                  }}
                >
                  {t.previewCaption}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#0c0d0f",
          color: "#f4f1ea",
          padding: "clamp(40px,5vw,64px) clamp(20px,4vw,56px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 24,
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isHe ? "flex-end" : "flex-start",
                gap: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-heebo), Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: 20,
                  color: "#f4f1ea",
                  lineHeight: 1,
                }}
              >
                עוצמה
              </span>
              <span
                style={{
                  fontFamily: "var(--font-oswald), Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  letterSpacing: "0.28em",
                  color: "rgba(244,241,234,0.35)",
                }}
              >
                OTZMA
              </span>
            </div>
            <div
              style={{
                display: "inline-block",
                border: "1px solid rgba(244,241,234,0.18)",
                borderRadius: 9999,
                padding: "3px 11px",
                fontSize: 11,
                color: "rgba(244,241,234,0.35)",
                fontFamily: "var(--font-heebo), Arial, sans-serif",
              }}
            >
              {c.footerBadge}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: isHe ? "flex-end" : "flex-start" }}>
            {socialLinks && (
              <SocialIcons links={socialLinks} size="sm" onDark />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Flag code={country.code} width={28} height={19} />
              <span style={{ fontSize: 13, color: "rgba(244,241,234,0.45)" }}>
                {t.footerViewing}
              </span>
              <button
                onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(() => setPickerOpen(true), 400) }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: accentHex,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "var(--font-heebo), Arial, sans-serif",
                  padding: 0,
                }}
              >
                {t.footerSwitch}
              </button>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  )
}
