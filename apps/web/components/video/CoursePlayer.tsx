"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../../lib/admin-client";
import { getDeviceId } from "../../lib/device";
import { playSuccess } from "../../lib/melody";
import {
  isOnline,
  isSavedOffline,
  offlineUrl,
  saveOffline,
} from "../../lib/offline-videos";
import { getStudentSession } from "../../lib/student-auth";
import {
  embedUrl,
  isInlinePlayable,
  type Checkpoint,
  type VideoCourse,
} from "../../lib/video-sources";
import { Confetti } from "../feedback/Confetti";
import { XpToasts, type XpToast } from "../feedback/XpToast";

interface CoursePlayerProps {
  course: VideoCourse;
}

function storageKey(courseId: string): string {
  return `ischool-video-progress-${courseId}`;
}

function timeKey(lectureId: string): string {
  return `ischool-video-time-${lectureId}`;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RATES = [1, 1.25, 1.5, 2, 0.5];

function loadTime(id: string): number {
  try {
    const v = Number(window.localStorage.getItem(timeKey(id)));
    return Number.isFinite(v) && v > 10 ? v : 0;
  } catch {
    return 0;
  }
}

function currentUserId(): string {
  try {
    return getStudentSession()?.studentId || getDeviceId();
  } catch {
    return "guest";
  }
}

async function reportProgress(courseId: string, lectureId: string, xp: number, pct: number): Promise<void> {
  try {
    await fetch(`${API_BASE}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUserId(),
        topic: `video:${courseId}:${lectureId}`,
        xp,
        progress_percentage: Math.min(100, Math.max(0, Math.round(pct))),
      }),
    });
  } catch {
    /* offline — cached locally, counted on next sync */
  }
}

/**
 * Epic 3.1 adaptive player: Udemy-style sidebar + native transport with
 * resume, lazy-HLS (.m3u8), offline blob replay, in-video checkpoint
 * check-ins, slow-network states, and the feedback kit
 * (confetti + XP toasts + melody). Iframe sources keep embed stage with
 * inline check-in cards (no time tracking possible).
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
  const [sound, setSound] = useState(true);
  const [slow, setSlow] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeCp, setActiveCp] = useState<Checkpoint | null>(null);
  const [cpResult, setCpResult] = useState<"idle" | "good" | "bad">("idle");
  const [toasts, setToasts] = useState<XpToast[]>([]);
  const [confettiKey, setConfettiKey] = useState(0);
  const [resumed, setResumed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const slowTimer = useRef<number | null>(null);
  const answered = useRef<Set<string>>(new Set());
  const lastSaved = useRef(0);

  const current = flat.find((f) => f.lecture.id === currentId) ?? flat[0];
  const idx = flat.findIndex((f) => f.lecture.id === current?.lecture.id);
  const checkpoints = useMemo(
    () => [...(current?.lecture.checkpoints ?? [])].sort((a, b) => a.atSec - b.atSec),
    [current]
  );
  const nativeFile =
    current != null &&
    (current.lecture.video.provider === "direct" ||
      (current.lecture.video.provider === "terabox" && Boolean(current.lecture.video.directUrl)));
  const fileUrl = current ? embedUrl(current.lecture.video, "file") : "";
  const isHls = nativeFile && /\.m3u8(\?|#|$)/i.test(fileUrl);

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
    setSlow(false);
    setFailed(false);
    setActiveCp(null);
    setCpResult("idle");
    setResumed(false);
    answered.current = new Set();
    lastSaved.current = 0;
    setBlobUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    if (!current) return;
    // Offline-first: cached blob wins when the network is gone.
    if (!isOnline()) {
      offlineUrl(current.lecture.id, embedUrl(current.lecture.video, "file")).then((u) => {
        if (u) setBlobUrl(u);
      });
    }
    isSavedOffline(current.lecture.id).then(setSaved).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, retryKey]);

  // Lazy HLS: native Safari plays .m3u8 directly, others get hls.js on demand.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !nativeFile || !isHls || blobUrl) return;
    let hls: { destroy: () => void } | null = null;
    let cancelled = false;
    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = fileUrl;
    } else {
      import("hls.js")
        .then((mod) => {
          if (cancelled) return;
          const Hls = mod.default;
          if (Hls.isSupported()) {
            const inst = new Hls({ capLevelToPlayerSize: true });
            inst.loadSource(fileUrl);
            inst.attachMedia(v);
            hls = inst;
          } else {
            setFailed(true);
          }
        })
        .catch(() => {
          if (!cancelled) setFailed(true);
        });
    }
    return () => {
      cancelled = true;
      hls?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, nativeFile, isHls, blobUrl, currentId, retryKey]);

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

  function pushToast(text: string): void {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }

  function celebrate(xp: number): void {
    setConfettiKey((k) => k + 1);
    pushToast(`+${xp} XP 🎉`);
    if (sound) playSuccess();
  }

  function go(delta: 1 | -1): void {
    const next = flat[idx + delta];
    if (next) setCurrentId(next.lecture.id);
  }

  function saveTime(t: number): void {
    if (!current || Math.abs(t - lastSaved.current) < 5) return;
    lastSaved.current = t;
    try {
      window.localStorage.setItem(timeKey(current.lecture.id), String(Math.floor(t)));
    } catch { /* no-op */ }
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

  function onTimeUpdate(t: number): void {
    setTime(t);
    saveTime(t);
    if (activeCp || !current) return;
    const hit = checkpoints.find((c) => t >= c.atSec && !answered.current.has(`${current.lecture.id}@${c.atSec}`));
    if (hit) {
      videoRef.current?.pause();
      setCpResult("idle");
      setActiveCp(hit);
    }
  }

  function answerCp(choice: number): void {
    if (!activeCp || !current) return;
    const ok = choice === activeCp.correctChoiceIndex;
    answered.current.add(`${current.lecture.id}@${activeCp.atSec}`);
    if (ok) {
      const xp = activeCp.xp ?? 5;
      setCpResult("good");
      celebrate(xp);
      void reportProgress(course.id, current.lecture.id, xp, (time / Math.max(1, dur)) * 100);
    } else {
      setCpResult("bad");
    }
  }

  function closeCp(resume: boolean): void {
    setActiveCp(null);
    setCpResult("idle");
    if (resume) void videoRef.current?.play().catch(() => undefined);
  }

  async function download(): Promise<void> {
    if (!current) return;
    const ok = await saveOffline(current.lecture.id, fileUrl);
    if (ok) {
      setSaved(true);
      pushToast("⬇️ Saved for offline");
    } else {
      pushToast("Can't download this source");
    }
  }

  function onSlowStart(): void {
    if (slowTimer.current) return;
    slowTimer.current = window.setTimeout(() => setSlow(true), 1500);
  }

  function onPlaying(): void {
    setPlaying(true);
    setSlow(false);
    if (slowTimer.current) {
      window.clearTimeout(slowTimer.current);
      slowTimer.current = null;
    }
    // Silent resume on first play if we have a saved position.
    if (!resumed && videoRef.current) {
      const at = loadTime(current?.lecture.id ?? "");
      if (at > 0 && videoRef.current.duration - at > 10) {
        videoRef.current.currentTime = at;
        pushToast(`Resumed ${fmt(at)} ⏯`);
      }
      setResumed(true);
    }
  }

  if (!current) return <p>No lectures yet — teachers add videos in the next sprint.</p>;

  const stageUrl = nativeFile
    ? embedUrl(current.lecture.video, "file")
    : embedUrl(current.lecture.video, "embed");
  const external = !isInlinePlayable(current.lecture.video);
  const progressPct = dur > 0 ? Math.min(100, (time / dur) * 100) : 0;

  return (
    <div className="courseplayer">
      <Confetti burstKey={confettiKey} />
      <XpToasts items={toasts} />
      <div className="courseplayer-stage">
        {nativeFile && !failed ? (
          <video
            key={`${current.lecture.id}-${retryKey}`}
            ref={videoRef}
            src={isHls || blobUrl ? undefined : blobUrl ?? stageUrl}
            playsInline
            preload="metadata"
            onPlay={onPlaying}
            onPause={() => {
              setPlaying(false);
              saveTime(videoRef.current?.currentTime ?? 0);
            }}
            onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
            onWaiting={onSlowStart}
            onStalled={onSlowStart}
            onError={() => setFailed(true)}
            onEnded={() => {
              markDone(current.lecture.id);
              void reportProgress(course.id, current.lecture.id, 10, 100);
              celebrate(10);
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
        ) : failed ? (
          <div className="courseplayer-external">
            <p>⚠️ ভিডিও লোড হয়নি — নেটওয়ার্ক দেখো।</p>
            <button className="btn primary" onClick={() => { setFailed(false); setRetryKey((k) => k + 1); }}>
              আবার চেষ্টা করো ↻
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

        {slow && nativeFile && !failed && (
          <div className="net-note" role="status">⏳ Slow connection — buffering…</div>
        )}
        {!isOnline() && blobUrl && (
          <div className="net-note offline" role="status">📴 Offline replay</div>
        )}

        {activeCp && (
          <div className="checkpoint" role="dialog" aria-label="Check-in quiz">
            <h4>✋ একটু দাঁড়াও!</h4>
            <p>{activeCp.prompt}</p>
            {activeCp.choices.map((c, i) => (
              <button
                key={i}
                type="button"
                className="btn ghost opt"
                disabled={cpResult === "good"}
                onClick={() => answerCp(i)}
              >
                {c}
              </button>
            ))}
            {cpResult === "good" && (
              <button type="button" className="btn primary opt" onClick={() => closeCp(true)}>
                শাবাশ! চালিয়ে যাই ▶
              </button>
            )}
            {cpResult === "bad" && (
              <>
                <p>ভুল হয়েছে — আবার ভাবো 💪</p>
                <button type="button" className="btn ghost opt" onClick={() => setCpResult("idle")}>
                  আবার চেষ্টা করি
                </button>
                <button type="button" className="btn ghost opt" onClick={() => closeCp(true)}>
                  এড়িয়ে যাই →
                </button>
              </>
            )}
          </div>
        )}

        {nativeFile && !failed && (
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
            <button
              className="tbtn"
              aria-label={sound ? "Mute celebration sounds" : "Enable celebration sounds"}
              onClick={() => setSound((s) => !s)}
            >
              {sound ? "🔔" : "🔕"}
            </button>
            <button
              className="tbtn"
              aria-label={saved ? "Saved offline" : "Download for offline"}
              onClick={download}
            >
              {saved ? "✅" : "⬇️"}
            </button>
            <button className="tbtn" onClick={fullscreen} aria-label="Fullscreen">⛶</button>
          </div>
        )}
      </div>

      {!nativeFile && !external && checkpoints.length > 0 && (
        <div className="sheet" style={{ textAlign: "left" }}>
          <h4>✋ Check-ins ({checkpoints.length})</h4>
          {checkpoints.map((c, i) => (
            <details key={i}>
              <summary>{c.prompt}</summary>
              <div style={{ display: "grid", gap: 6, margin: "8px 0" }}>
                {c.choices.map((ch, j) => (
                  <button
                    key={j}
                    type="button"
                    className="btn ghost opt"
                    onClick={() => {
                      if (j === c.correctChoiceIndex) {
                        celebrate(c.xp ?? 5);
                        if (current) void reportProgress(course.id, current.lecture.id, c.xp ?? 5, 50);
                      } else {
                        pushToast("আবার ভাবো 💪");
                      }
                    }}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}

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
                    {(l.checkpoints?.length ?? 0) > 0 && <span title="Has check-ins">✋</span>}
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
