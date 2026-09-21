"use client";

interface XpBarProps {
  progress: number;
}

export function XpBar({ progress }: XpBarProps) {
  const safe = Math.min(100, Math.max(0, Math.round(progress)));
  return (
    <div
      className="h-4 rounded-full border-[3px] border-ink bg-[#e6f4ec] overflow-hidden"
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-accent2 to-lime-400 transition-all duration-300"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}
