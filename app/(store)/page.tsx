"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { COUNTRIES, isValidCountry, type CountryCode, type Country } from "@/lib/countries"

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

export default function CountryGatePage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("otzma_country")
    if (saved && isValidCountry(saved)) {
      router.replace(`/${saved}`)
    } else {
      setChecked(true)
    }
  }, [router])

  if (!checked) return null

  return <CountryGateUI />
}

function CountryGateUI() {
  const router = useRouter()
  const [hoveredCode, setHoveredCode] = useState<CountryCode | null>(null)

  function handleSelect(code: CountryCode) {
    localStorage.setItem("otzma_country", code)
    router.push(`/${code}`)
  }

  const countries = Object.values(COUNTRIES) as Country[]

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "#0c0d0f",
        color: "#f4f1ea",
        fontFamily: "var(--font-heebo), Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background decorations */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Radial gradient 1 */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "60vw",
            height: "60vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(35,86,199,0.18) 0%, transparent 70%)",
            opacity: 0.5,
          }}
        />
        {/* Radial gradient 2 */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            left: "-10%",
            width: "50vw",
            height: "50vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(192,32,46,0.15) 0%, transparent 70%)",
            opacity: 0.5,
          }}
        />
        {/* PRIDE watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "-2%",
            left: "-1%",
            fontFamily: "var(--font-oswald), Arial, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(120px,26vw,460px)",
            color: "rgba(255,255,255,0.025)",
            lineHeight: 1,
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          PRIDE
        </div>
      </div>

      {/* Content wrapper */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px clamp(20px,4vw,56px)",
          }}
        >
          {/* Brand lockup */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span
              style={{
                fontFamily: "var(--font-heebo), Arial, sans-serif",
                fontWeight: 900,
                fontSize: 22,
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
                fontSize: 13,
                letterSpacing: "0.28em",
                color: "rgba(244,241,234,0.45)",
                lineHeight: 1,
              }}
            >
              OTZMA
            </span>
          </div>

          {/* Placeholder badge */}
          <div
            style={{
              border: "1px solid rgba(244,241,234,0.2)",
              borderRadius: 9999,
              padding: "5px 14px",
              fontSize: 12,
              color: "rgba(244,241,234,0.45)",
            }}
          >
            שם ולוגו זמניים
          </div>
        </div>

        {/* Center block */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(32px,5vw,72px) clamp(20px,4vw,56px)",
            maxWidth: 1180,
            margin: "0 auto",
            width: "100%",
            textAlign: "center",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: "var(--font-oswald), Arial, sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.34em",
              color: "#c0985a",
              textTransform: "uppercase",
              marginBottom: 24,
            }}
          >
            ENTER · בחר את הדגל שלך
          </div>

          {/* H1 */}
          <h1
            style={{
              fontFamily: "var(--font-heebo), Arial, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(40px,7vw,96px)",
              lineHeight: 0.96,
              letterSpacing: "-0.025em",
              maxWidth: "14ch",
              margin: "0 auto 20px",
              color: "#f4f1ea",
            }}
          >
            לאיזו מדינה אתה שייך?
          </h1>

          {/* Lead */}
          <p
            style={{
              fontSize: "clamp(16px,1.5vw,21px)",
              color: "rgba(244,241,234,0.6)",
              maxWidth: "52ch",
              margin: "0 auto 40px",
              lineHeight: 1.55,
            }}
          >
            בחר את המדינה שלך כדי לראות את הקולקציה המותאמת עם כיתובים, צבעים ומשלוח לאזורך
          </p>

          {/* Country grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(252px, 1fr))",
              gap: 14,
              width: "100%",
            }}
          >
            {countries.map((country) => {
              const isHovered = hoveredCode === country.code
              return (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country.code as CountryCode)}
                  onMouseEnter={() => setHoveredCode(country.code as CountryCode)}
                  onMouseLeave={() => setHoveredCode(null)}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    padding: "18px 20px",
                    background: isHovered
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.025)",
                    border: isHovered
                      ? "1px solid rgba(244,241,234,0.4)"
                      : "1px solid rgba(244,241,234,0.12)",
                    borderRadius: 4,
                    cursor: "pointer",
                    textAlign: "right",
                    direction: "rtl",
                    transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                    transition: "all 0.18s ease",
                    width: "100%",
                  }}
                >
                  {/* Flag */}
                  <div style={{ flexShrink: 0, lineHeight: 0 }}>
                    <Flag code={country.code} width={52} height={35} />
                  </div>

                  {/* Name block */}
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-heebo), Arial, sans-serif",
                        fontWeight: 800,
                        fontSize: 19,
                        color: "#f4f1ea",
                        lineHeight: 1.1,
                      }}
                    >
                      {country.nameHe}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-oswald), Arial, sans-serif",
                        fontWeight: 500,
                        fontSize: 12,
                        letterSpacing: "0.18em",
                        color: "rgba(244,241,234,0.45)",
                        marginTop: 2,
                      }}
                    >
                      {country.en}
                    </div>
                  </div>

                  {/* Code chip */}
                  <div
                    style={{
                      fontFamily: "var(--font-oswald), Arial, sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      border: "1px solid rgba(244,241,234,0.25)",
                      borderRadius: 3,
                      padding: "3px 7px",
                      color: "rgba(244,241,234,0.6)",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {country.code}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Footnote */}
          <p
            style={{
              marginTop: 32,
              fontSize: 12,
              color: "rgba(244,241,234,0.3)",
              textAlign: "center",
            }}
          >
            קונספט · המסך הראשי משתנה לפי המדינה שנבחרה
          </p>
        </div>
      </div>
    </div>
  )
}
