"use client";
import { useEffect, useRef } from "react";
import { makeStars, shouldAnimate, starCountFor, twinkle, type Star } from "../../lib/cosmos";

const HUE_COLOR: Record<Star["hue"], string> = {
  white: "255,255,255",
  cyan: "77,227,255",
  gold: "255,209,102",
  violet: "167,139,255",
};

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

/**
 * "Learning beyond the sky" — fixed galactic backdrop:
 * drifting nebula blobs (CSS) + twinkling parallax starfield (canvas)
 * + slow rotating geometric constellation (SVG) + occasional meteors.
 * Zero pointer events, pauses off-screen, static when reduced motion.
 */
export function CosmosBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let raf = 0;
    let last = 0;
    let nextMeteor = 4;
    const animated = shouldAnimate();

    function resize(): void {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.floor(window.innerWidth * dpr);
      canvas!.height = Math.floor(window.innerHeight * dpr);
      stars = makeStars(starCountFor(window.innerWidth, window.innerHeight));
    }
    resize();
    draw(0);

    function draw(t: number): void {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);
      const tSec = t / 1000;
      const drift = animated ? (tSec * 0.004) % 1 : 0;
      for (const s of stars) {
        const x = (((s.x + drift * s.speed) % 1) * w) / dpr;
        const y = (s.y * h) / dpr;
        const a = animated ? twinkle(s, tSec) : 0.8;
        ctx!.beginPath();
        ctx!.arc(x, y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${HUE_COLOR[s.hue]},${a.toFixed(3)})`;
        ctx!.fill();
      }
      for (const m of meteors) {
        ctx!.strokeStyle = `rgba(255,255,255,${(m.life * 0.8).toFixed(3)})`;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(m.x / dpr, m.y / dpr);
        ctx!.lineTo((m.x - m.vx * 12) / dpr, (m.y - m.vy * 12) / dpr);
        ctx!.stroke();
      }
    }

    function frame(t: number): void {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      const tSec = t / 1000;
      if (tSec > nextMeteor && meteors.length < 2) {
        nextMeteor = tSec + 5 + Math.random() * 7;
        const w = canvas!.width;
        meteors.push({
          x: Math.random() * w * 0.7 + w * 0.2,
          y: Math.random() * canvas!.height * 0.25,
          vx: 9 + Math.random() * 5,
          vy: 4 + Math.random() * 2.5,
          life: 1,
        });
      }
      meteors = meteors
        .map((m) => ({ ...m, x: m.x + m.vx * dt * 60, y: m.y + m.vy * dt * 60, life: m.life - dt * 1.4 }))
        .filter((m) => m.life > 0);
      draw(t);
      raf = requestAnimationFrame(frame);
    }

    function onVis(): void {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (animated) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        draw(performance.now());
      }
    }

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (animated) raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="cosmos" aria-hidden="true">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <canvas ref={canvasRef} className="starfield" />
      <svg className="constellation" viewBox="0 0 400 400">
        <g fill="none" strokeWidth="1.2" className="const-lines">
          <circle cx="200" cy="200" r="120" />
          <circle cx="200" cy="200" r="78" strokeDasharray="4 6" />
          <polygon points="200,80 304,260 96,260" />
          <line x1="200" y1="80" x2="200" y2="320" />
          <line x1="96" y1="260" x2="304" y2="260" />
        </g>
        <g className="const-nodes">
          <circle cx="200" cy="80" r="4" />
          <circle cx="304" cy="260" r="4" />
          <circle cx="96" cy="260" r="4" />
          <circle cx="200" cy="200" r="5" />
          <circle cx="200" cy="320" r="3" />
          <circle cx="278" cy="200" r="3" />
          <circle cx="122" cy="200" r="3" />
        </g>
      </svg>
      <div className="orbit orbit-1" />
      <div className="orbit orbit-2" />
    </div>
  );
}
