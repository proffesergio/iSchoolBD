"use client";
import { useEffect, useState } from "react";
import { shuffled, type Headline } from "../../lib/headlines";

const ROTATE_MS = 4200;

/**
 * Contextual animated headline: cycles a shuffled pool with a
 * fade-rise transition, reshuffling every full cycle so the order
 * always feels random. First render is deterministic (prop order) so
 * server HTML and hydration match; shuffling starts after mount.
 * Static first line under reduced motion.
 */
export function RotatingHeadline({ lines }: { lines: Headline[] }) {
  const [order, setOrder] = useState<Headline[]>(lines);
  const [idx, setIdx] = useState(0);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    setOrder(shuffled(lines));
    setIdx(0);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setCalm(true);
      return;
    }
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIdx((i) => (i + 1) % lines.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (order.length === 0) return null;
  if (calm) return <span>{lines[0]?.text ?? ""}</span>;
  const line = order[idx % order.length];
  return (
    <span key={`${idx}-${line.text}`} className="headline-swap">
      {line.text}
    </span>
  );
}
