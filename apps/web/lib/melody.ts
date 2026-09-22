/**
 * Tiny WebAudio success melody (C–E–G arpeggio) — zero assets, offline-safe.
 * Returns false when audio is unsupported so callers can stay silent.
 * Never throws; never autoplays without a user-gesture-initiated call path
 * (call only from tap/completion handlers, not render).
 */

let ctx: AudioContext | null = null;

export function playSuccess(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return false;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx!.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
    return true;
  } catch {
    return false;
  }
}
