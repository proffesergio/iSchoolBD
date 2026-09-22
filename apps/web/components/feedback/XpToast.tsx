"use client";

export interface XpToast {
  id: number;
  text: string;
}

/** Floating "+XP" stack above the bottom nav. Pure render; player owns timing. */
export function XpToasts({ items }: { items: XpToast[] }) {
  if (items.length === 0) return null;
  return (
    <div className="xp-toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="xp-toast sparkle">
          {t.text}
        </div>
      ))}
    </div>
  );
}
