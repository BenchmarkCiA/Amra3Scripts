interface Props {
  limitedTimeLabel?: string | null
}

function MoneyBackBadge() {
  return (
    <div style={{
      width: 72,
      height: 72,
      borderRadius: "50%",
      border: "2px solid #8B6914",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #fdf8ee 0%, #f5e9c8 100%)",
      flexShrink: 0,
      gap: 0,
      padding: "6px 4px",
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#8B6914", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1 }}>Money Back</span>
      <span style={{ fontSize: 22, fontWeight: 900, color: "#8B6914", lineHeight: 1.1 }}>30</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#8B6914", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1 }}>Day</span>
      <span style={{ fontSize: 7.5, fontWeight: 600, color: "#A07820", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.2 }}>Guarantee</span>
    </div>
  )
}

function SecureBadge() {
  return (
    <div style={{
      width: 72,
      height: 72,
      borderRadius: "50%",
      border: "2px solid #1a7a4a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #edfaf3 0%, #c8eedd 100%)",
      flexShrink: 0,
      gap: 2,
      padding: "6px 4px",
    }}>
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5l-8-3z" fill="#1a7a4a" opacity={0.15} />
        <path d="M12 2L4 5v6c0 5.25 3.5 10.15 8 11.35C16.5 21.15 20 16.25 20 11V5l-8-3z" stroke="#1a7a4a" strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="#1a7a4a" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#1a7a4a", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1 }}>Secure</span>
      <span style={{ fontSize: 8, fontWeight: 600, color: "#1a7a4a", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1.2 }}>Purchase</span>
    </div>
  )
}

export default function ProductTrustBadges({ limitedTimeLabel }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {limitedTimeLabel && (
        <div style={{
          border: "1.5px solid rgba(220, 80, 30, 0.35)",
          borderRadius: 10,
          padding: "10px 14px",
          background: "rgba(220, 80, 30, 0.04)",
        }}>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c04a15",
            marginBottom: 2,
          }}>
            ⏰ Limited Time Only
          </p>
          <p style={{ fontSize: 14, fontWeight: 500, color: "inherit", margin: 0 }}>
            {limitedTimeLabel}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <MoneyBackBadge />
        <SecureBadge />
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span>✓ Free returns within 30 days</span>
          <span>✓ Encrypted payment</span>
          <span>✓ No hidden fees</span>
        </div>
      </div>
    </div>
  )
}
