"use client";
import { useEffect, useRef, useState } from "react";
import {
  TRACE_CELL,
  cellKey,
  coverageScore,
  passesTrace,
  pointToCell,
} from "../../lib/trace";

interface TraceCanvasProps {
  letter: string;
  onComplete: () => void;
}

const SIZE = 300;
const GUIDE_FONT = "220px 'Hind Siliguri', 'Noto Sans Bengali', sans-serif";

/**
 * Finger-tracing board — the digital marker pen.
 * The letter renders as a light guide; the child draws over it.
 * Guide pixels are sampled into coarse cells, strokes mark cells touched,
 * and ≥60% coverage completes the trace (+XP from the parent, once).
 */
export function TraceCanvas({ letter, onComplete }: TraceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<{ x: number; y: number }[][]>([]);
  const touchedRef = useRef<Set<string>>(new Set());
  const guideRef = useRef<Set<string>>(new Set());
  const drawingRef = useRef(false);
  const doneRef = useRef(false);
  const completedRef = useRef(onComplete);
  completedRef.current = onComplete;

  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Sample the guide glyph into cells once the font is ready.
  useEffect(() => {
    doneRef.current = false;
    setDone(false);
    setScore(0);
    strokesRef.current = [];
    let cancelled = false;

    function sample(): void {
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.font = GUIDE_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(letter, SIZE / 2, SIZE / 2 + 8);
      try {
        const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
        const guide = new Set<string>();
        for (let y = 0; y < SIZE; y += 4) {
          for (let x = 0; x < SIZE; x += 4) {
            if (data[(y * SIZE + x) * 4 + 3]! > 100) {
              const { col, row } = pointToCell(x, y, TRACE_CELL);
              guide.add(cellKey(col, row));
            }
          }
        }
        guideRef.current = guide;
      } catch {
        guideRef.current = new Set();
      }
    }

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) sample();
      }).catch(() => undefined);
    } else {
      sample();
    }
    return () => {
      cancelled = true;
    };
  }, [letter]);

  function redraw(): void {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.font = GUIDE_FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(letter, SIZE / 2, SIZE / 2 + 8);
    ctx.strokeStyle = "#22b07d";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokesRef.current) {
      ctx.beginPath();
      stroke.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  }

  function pos(e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  }

  function touch(p: { x: number; y: number }): void {
    const { col, row } = pointToCell(p.x, p.y, TRACE_CELL);
    const key = cellKey(col, row);
    const strokes = strokesRef.current;
    const current = strokes[strokes.length - 1];
    if (current) current.push(p);
    const guide = guideRef.current;
    // Touched persists across strokes until cleared.
    touchedRef.current.add(key);
    const inside = [...touchedRef.current].filter((k) => guide.has(k)).length;
    const s = coverageScore(inside, guide.size);
    setScore(s);
    if (!doneRef.current && passesTrace(s)) {
      doneRef.current = true;
      setDone(true);
      completedRef.current();
    }
  }

  function clear(): void {
    strokesRef.current = [];
    touchedRef.current = new Set();
    setScore(0);
    redraw();
  }

  return (
    <div className="mt-2">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={`Trace the letter ${letter}`}
        className="mx-auto w-full max-w-[300px] touch-none rounded-2xl border-[3px] border-ink bg-white"
        style={{ aspectRatio: "1 / 1" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawingRef.current = true;
          strokesRef.current.push([pos(e)]);
          touch(pos(e));
          redraw();
        }}
        onPointerMove={(e) => {
          if (!drawingRef.current) return;
          const p = pos(e);
          touch(p);
          redraw();
        }}
        onPointerUp={() => {
          drawingRef.current = false;
        }}
        onPointerCancel={() => {
          drawingRef.current = false;
        }}
      />
      <div className="mt-2 flex items-center justify-center gap-2">
        <div
          className="h-3 w-40 overflow-hidden rounded-full border-2 border-ink bg-gray-100"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full transition-all ${done ? "bg-accent2" : "bg-accent3"}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="font-bengali text-sm font-extrabold">{done ? "✅ দারুণ!" : `${score}%`}</span>
        <button
          type="button"
          onClick={clear}
          className="rounded-full border-2 border-ink bg-white px-3 py-1 text-sm font-black shadow-[2px_2px_0_#16324f] active:translate-y-0.5"
        >
          🧽 মুছো
        </button>
      </div>
    </div>
  );
}
