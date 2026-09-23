"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadProgress, type ChapterProgress } from "@/lib/chapter-progress";
import { MiniRing } from "@/components/ui/MiniRing";

interface ChapterRow {
  id: string;
  titleBn: string;
  titleEn: string;
  lessons: number;
  questions: number;
}

/** Chapter list with per-chapter best-score rings (device progress). */
export function ChapterList({ classId, subject, chapters }: { classId: string; subject: string; chapters: ChapterRow[] }) {
  const [progress, setProgress] = useState<ChapterProgress>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {chapters.map((ch, i) => {
        const rec = progress[ch.id];
        const pct = rec?.done ? Math.round(rec.best * 100) : 0;
        return (
          <Link
            key={ch.id}
            href={`/courses/${classId}/${subject}/${ch.id}`}
            className="card"
            style={{
              textDecoration: "none", color: "inherit", fontSize: 18, textAlign: "left",
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", animation: "none",
            }}
          >
            <MiniRing pct={pct} label={`${ch.titleBn} ${pct}%`} />
            <span style={{ flex: 1 }}>
              <strong>{i + 1}. {ch.titleBn}</strong>
              <small style={{ display: "block", fontSize: 13, opacity: 0.7 }}>
                {ch.titleEn} · {ch.lessons} পাঠ · {ch.questions} কুইজ {rec?.done ? `· সেরা ${pct}%` : ""}
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        );
      })}
    </div>
  );
}
