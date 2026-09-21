"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { embedUrl, isInlinePlayable, type VideoCourse } from "../../lib/video-sources";

interface CoursePlayerProps {
  course: VideoCourse;
}

function storageKey(courseId: string): string {
  return `ischool-video-progress-${courseId}`;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RATES = [1, 1.25, 1.5, 2, 0.5];

/**
 * Udemy-style course player: lecture sidebar + stage + full transport
 * controls for native files (play/pause, seek, rate, volume, fullscreen,
 * next/prev) and embed stage + manual completion for iframe sources.
 */
export function CoursePlayer({ course }: CoursePlayerProps) {
  const flat = useMemo(
    () => course.sections.flatMap((s) => s.lectures.map((l) => ({ section: s, lecture: l }))),
    [course]
  );
  const [currentId, setCurrentId] = useState(flat[0]?.lecture.id ?? "");
  const [done, setDone] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const current = flat.find((f) => f.lecture.id === currentId) ?? flat[0];
  const idx = flat.findIndex((f) => f.lecture.id === current?.lecture.id);
  const nativeFile =
    current != null &&
    (current.lecture.video.provider === "direct" ||
      (current.lecture.video.provider === "terabox" && Boolean(current.lecture.video.directUrl)));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(course.id));
      if (raw) setDone(JSON.parse(raw) as string[]);
    } catch { /* private mode */ }
  }, [course.id]);

  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setDur(current?.lecture.durationSec ?? 0);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  function persist(next: string[]): void {
    setDone(next);
    try {
      window.localStorage.setItem(storageKey(course.id), JSON.stringify(next));
    } catch { /* no-op */ }
  }

  const markDone = useCallback(
    (id: string) => {
      persist(done.includes(id) ? done : [...done, id]);
    },
    [done] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function go(delta: 1 | -1): void {
    const next = flat[idx + delta];
    if (next) setCurrentId(next.lecture.id);
  }

  async function togglePlay(): Promise<void> {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      await v.play().catch(() => undefined);
    } else {
      v.pause();
    }
  }

  function cycleRate(): void {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }

  async function fullscreen(): Promise<void> {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    else await v.requestFullscreen?.().catch(() => undefined);
  }

  if (!current) return <p>No lectures yet — teachers add videos in the next sprint.</p>;

  const stageUrl = nativeFile
    ? embedUrl(current.lecture.video, "file")
    : embedUrl(current.lecture.video, "embed");
  const external = !isInlinePlayable(current.lecture.video);
  const progressPct = dur > 0 ? Math.min(100, (time / dur) * 100) : 0;

  return (
    <div className="courseplayer">
      <div className="courseplayer-stage">
        {nativeFile ? (
          <video
            key={current.lecture.id}
            ref={videoRef}
            src={stageUrl}
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
            onEnded={() => {
              markDone(current.lecture.id);
              go(1);
            }}
          />
        ) : external ? (
          <div className="courseplayer-external">
            <p>🔗 এই ভিডিও Terabox-এ খুলবে</p>
            <a className="btn primary" href={stageUrl} target="_blank" rel="noreferrer">
              Terabox-এ দেখো
            </a>
            <button className="btn ghost" onClick={() => markDone(current.lecture.id)}>
              দেখা শেষ ✓
            </button>
          </div>
        ) : (
          <iframe
            key={current.lecture.id}
            src={stageUrl}
            title={current.lecture.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {nativeFile && (
          <div className="transport" role="toolbar" aria-label="Video controls">
            <button className="tbtn" onClick={() => go(-1)} disabled={idx <= 0} aria-label="Previous">⏮</button>
            <button className="tbtn big" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? "⏸" : "▶"}
            </button>
            <button className="tbtn" onClick={() => go(1)} disabled={idx >= flat.length - 1} aria-label="Next">⏭</button>
            <span className="ttime">{fmt(time)} / {fmt(dur)}</span>
            <input
              className="tseek"
              type="range"
              min={0}
              max={Math.max(1, Math.floor(dur))}
              value={Math.floor(time)}
              aria-label="Seek"
              onChange={(e) => {
                const t = Number(e.target.value);
                if (videoRef.current) videoRef.current.currentTime = t;
                setTime(t);
              }}
            />
            <button className="tbtn" onClick={cycleRate} aria-label="Playback speed">{rate}x</button>
            <button
              className="tbtn"
              aria-label={muted ? "Unmute" : "Mute"}
              onClick={() => {
                const v = videoRef.current;
                const next = !muted;
                setMuted(next);
                if (v) v.muted = next;
              }}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button className="tbtn" onClick={fullscreen} aria-label="Fullscreen">⛶</button>
          </div>
        )}
      </div>
      <ol className="playlist">
        {course.sections.map((s) => (
          <li key={s.id}>
            <p className="playlist-section">{s.title}</p>
            <ol>
              {s.lectures.map((l) => (
                <li key={l.id}>
                  <button
                    className={l.id === current.lecture.id ? "lecture active" : "lecture"}
                    onClick={() => setCurrentId(l.id)}
                    aria-current={l.id === current.lecture.id ? "true" : undefined}
                  >
                    <span>{done.includes(l.id) ? "✅" : "▶"}</span>
                    <span className="lecture-title">{l.title}</span>
                    {typeof l.durationSec === "number" && (
                      <span className="lecture-dur">{fmt(l.durationSec)}</span>
                    )}
                  </button>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}
