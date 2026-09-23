"use client";

interface MiniRingProps {
  pct: number; // 0..100
  label: string;
  size?: number;
}

/** Small SVG progress ring — consistent chapter/book completion visual. */
export function MiniRing({ pct, label, size = 64 }: MiniRingProps) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const safe = Math.min(100, Math.max(0, Math.round(pct)));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="7" className="ring-track" />
        <circle
          cx="32" cy="32" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
          className="ring-fill"
          strokeDasharray={c}
          strokeDashoffset={c - (safe / 100) * c}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13 }}>
        {safe}%
      </div>
    </div>
  );
}
