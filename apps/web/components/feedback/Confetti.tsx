"use client";
import { useEffect, useRef } from "react";

const COLORS = ["#7c6cff", "#4de3ff", "#ff6bd6", "#ffd166", "#2bd490", "#ffffff"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  life: number;
}

/**
 * Celebration confetti burst. Fires when `burstKey` changes to nonzero.
 * Canvas 2D, ~90 particles, auto-cleanup. Renders nothing under
 * prefers-reduced-motion.
 */
export function Confetti({ burstKey }: { burstKey: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!burstKey) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);

    const parts: Particle[] = Array.from({ length: 90 }, () => ({
      x: (window.innerWidth / 2 + (Math.random() - 0.5) * 220) * dpr,
      y: window.innerHeight * 0.35 * dpr,
      vx: (Math.random() - 0.5) * 14 * dpr,
      vy: (-6 - Math.random() * 7) * dpr,
      size: (4 + Math.random() * 5) * dpr,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1,
    }));

    let raf = 0;
    const start = performance.now();
    function frame(now: number): void {
      const el = (now - start) / 1400;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35 * dpr;
        p.rot += p.vr;
        p.life = 1 - el;
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.globalAlpha = Math.max(0, p.life);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx!.restore();
      }
      if (el < 1) raf = requestAnimationFrame(frame);
      else ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [burstKey]);

  if (!burstKey) return null;
  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
