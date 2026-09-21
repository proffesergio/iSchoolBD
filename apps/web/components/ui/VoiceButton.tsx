"use client";
import { useRef, useState } from "react";
import { speakBangla } from "../../lib/store";
import { autoSpeakAllowed, type TtsScope } from "../../lib/tts-policy";

interface VoiceButtonProps {
  /** admin-uploaded voice-over file (preferred everywhere) */
  audioUrl?: string;
  /** text to synthesize — only when scope allows autoplay-class TTS */
  text?: string;
  scope: TtsScope;
  label?: string;
}

/**
 * Manual voice-over button. Plays the admin's audio file when attached;
 * otherwise falls back to synthesis ONLY for child scopes (pre–class 2).
 * Renders nothing when there is nothing playable — TTS stays off elsewhere.
 */
export function VoiceButton({ audioUrl, text, scope, label = "🔊 শোনো" }: VoiceButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  async function playFile(): Promise<void> {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      setPlaying(false);
      return;
    }
    await el.play().catch(() => undefined);
  }

  function playTts(): void {
    if (text) speakBangla(text);
  }

  if (audioUrl) {
    return (
      <>
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        <button type="button" onClick={playFile} aria-label={playing ? "Pause voice" : "Play voice"} className="btn ghost pwa-btn">
          {playing ? "⏸ শুনছি…" : label}
        </button>
      </>
    );
  }
  if (text && autoSpeakAllowed(scope)) {
    return (
      <button type="button" onClick={playTts} aria-label="Listen" className="btn ghost pwa-btn">
        {label}
      </button>
    );
  }
  return null;
}
