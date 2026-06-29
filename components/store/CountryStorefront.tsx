"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { type Country, formatCountryPrice } from "@/lib/countries"
import type { Product } from "@/types"

interface Props {
  country: Country
  products: Product[]
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function accentGlow(hex: string): string {
  return hexToRgba(hex, 0.22)
}

function getLowestPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) return 0
  return Math.min(...product.variants.map((v) => v.price))
}

export default function CountryStorefront({ country, products }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<"all" | string>("all")
  const [customText, setCustomText] = useState("השם שלך")
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  function switchCountry() {
    localStorage.removeItem("otzma_country")
    router.push("/")
  }

  const accentHex = country.accent
  const glowColor = accentGlow(accentHex)

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
      dir="rtl"
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
        כיתוב אישי על כל פריט · משלוח ל{country.shipLabel} · החזרה חינם 30 יום
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
        {/* Brand lockup (right in RTL) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
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

        {/* Nav (center) */}
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
            הלבשה
          </a>
          <a href="#collection" style={{ color: "#14161a", textDecoration: "none" }}>
            ציוד
          </a>
          <a
            href="#customizer"
            style={{ color: accentHex, textDecoration: "none", fontWeight: 600 }}
          >
            התאמה אישית
          </a>
        </nav>

        {/* Right cluster (left in RTL) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Country chip */}
          <button
            onClick={switchCountry}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              border: "1px solid rgba(17,19,22,0.2)",
              borderRadius: 9999,
              padding: "6px 13px",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              color: "#14161a",
              fontFamily: "var(--font-heebo), Arial, sans-serif",
            }}
          >
            <div
              style={{
                width: 22,
                height: 15,
                borderRadius: 2,
                background: country.flag,
                flexShrink: 0,
              }}
            />
            <span>{country.nameHe}</span>
            <span style={{ color: "rgba(17,19,22,0.45)" }}>· החלף</span>
          </button>

          {/* Avatar button */}
          <button
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
            }}
            aria-label="חשבון"
          >
            א
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
        {/* Left column */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 46,
                height: 31,
                borderRadius: 3,
                background: country.flag,
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                flexShrink: 0,
              }}
            />
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
              {country.en} COLLECTION
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
            השורשים שלך.{" "}
            <span style={{ display: "block" }}>בלי התנצלות.</span>
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
            קולקציית {country.nameHe} — הלבשה וציוד שנושאים את הכיתוב שאתה בוחר. הזהות שלך, בגוף ראשון.
          </p>

          {/* Button row */}
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
                transition: "filter 0.15s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.filter = "brightness(1.08)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.filter = "brightness(1)")}
            >
              לכל הקולקציה
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
                transition: "border-color 0.15s",
                display: "inline-block",
                background: "transparent",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.borderColor = "rgba(244,241,234,0.65)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.borderColor = "rgba(244,241,234,0.28)")
              }
            >
              עיצוב את שלך
            </a>
          </div>

          {/* Stat row */}
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
            {[
              { label: "+2,400", sub: "לקוחות מרוצים" },
              { label: "100%", sub: "כיתוב אישי" },
              { label: "30 יום", sub: "החזרה חינם" },
            ].map((stat) => (
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

        {/* Right column — campaign image placeholder */}
        <div
          style={{
            flex: "1 1 340px",
            minWidth: 340,
            position: "relative",
            background: `repeating-linear-gradient(135deg, rgba(255,255,255,.035) 0 2px, transparent 2px 16px)`,
            minHeight: 420,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Accent overlay */}
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
              תמונת קמפיין במקום זה
            </div>
          </div>
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
          {/* Header row */}
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
            {/* Left: title */}
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
                THE COLLECTION
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
                הקולקציה של {country.nameHe}
              </h2>
            </div>

            {/* Right: filter chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { value: "all", label: "הכל" },
                { value: "הלבשה", label: "הלבשה" },
                { value: "ציוד", label: "ציוד" },
              ].map((chip) => {
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
              אין מוצרים זמינים כרגע
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
                    {/* Image area */}
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

                      {/* כיתוב אישי pill */}
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          background: accentHex,
                          color: "#fff",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          fontFamily: "var(--font-heebo), Arial, sans-serif",
                        }}
                      >
                        כיתוב אישי
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: 16 }}>
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
                          {lowestPrice > 0
                            ? formatCountryPrice(lowestPrice, country)
                            : "—"}
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
                          הוסף לעגלה
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
          {/* Column A — Controls */}
          <div
            style={{
              flex: "1 1 340px",
              order: 2,
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
                textAlign: "right",
              }}
            >
              MAKE IT YOURS
            </div>
            <h2
              style={{
                fontFamily: "var(--font-heebo), Arial, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(30px,3.8vw,54px)",
                lineHeight: 1,
                margin: 0,
                textAlign: "right",
              }}
            >
              הכיתוב שלך.{" "}
              <span style={{ display: "block" }}>העוצמה שלך.</span>
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.55,
                margin: 0,
                textAlign: "right",
                fontSize: "clamp(14px,1.2vw,17px)",
              }}
            >
              הוסף את השם שלך, שנה משמעותית, ציטוט מהלב — על כל פריט בקולקציה. זו הזהות שלך.
            </p>

            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-heebo), Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 8,
                  textAlign: "right",
                }}
              >
                הכיתוב שלך
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
                  textAlign: "right",
                  outline: "none",
                  boxSizing: "border-box",
                  display: "block",
                  marginRight: "auto",
                }}
              />
            </div>

            {/* Preset chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
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
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.background = "rgba(255,255,255,0.25)")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.background = "rgba(255,255,255,0.15)")
                  }
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Column B — Live Preview */}
          <div
            style={{
              flex: "1 1 340px",
              order: 1,
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
              {/* Tint overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.18)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1, width: "100%", textAlign: "center" }}>
                {/* Top: flag + TEE PREVIEW */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: "clamp(20px,3vw,32px)",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 15,
                      borderRadius: 2,
                      background: country.flag,
                      flexShrink: 0,
                    }}
                  />
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
                    TEE · PREVIEW
                  </span>
                </div>

                {/* Dashed preview box */}
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
                    {customText || "השם שלך"}
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

                {/* Caption */}
                <div
                  style={{
                    marginTop: "clamp(16px,2vw,24px)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-heebo), Arial, sans-serif",
                  }}
                >
                  תצוגה מקדימה · אזור ההדפסה
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
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
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
              שם ולוגו זמניים
            </div>
          </div>

          {/* Country info + switch */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 28,
                height: 19,
                borderRadius: 3,
                background: country.flag,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: "rgba(244,241,234,0.45)" }}>
              גולש מ{country.shipLabel} · {country.currency.name}
            </span>
            <button
              onClick={switchCountry}
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
              החלף מדינה
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
