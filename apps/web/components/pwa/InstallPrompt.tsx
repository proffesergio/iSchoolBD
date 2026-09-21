"use client";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const SEEN_KEY = "ischool-pwa-prompt-seen-v1";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return (navigator as unknown as { standalone?: boolean }).standalone === true;
}

/**
 * Phone-first PWA install prompt.
 * Android/Chrome: uses beforeinstallprompt for a native install button.
 * iOS/Safari: no prompt API — shows Share → Add to Home Screen steps.
 * Shows at most once per device (persisted), "পরে" dismisses quietly.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (window.localStorage.getItem(SEEN_KEY)) return;
    } catch { /* private mode — still show */ }
    setIos(isIos());
    // iOS has no install event; show the guide after a beat on phones.
    if (isIos()) {
      const t = window.setTimeout(() => setVisible(true), 2500);
      return () => window.clearTimeout(t);
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible) return null;

  function dismiss(): void {
    setVisible(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch { /* no-op */ }
  }

  async function install(): Promise<void> {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
    dismiss();
  }

  return (
    <div className="pwa-prompt" role="dialog" aria-live="polite" aria-label="Install app">
      <span className="pwa-emoji" aria-hidden="true">📲</span>
      <div className="pwa-text">
        <strong>অ্যাপ ইনস্টল করো!</strong>
        {ios ? (
          <small>Share ⬆️ → Add to Home Screen চাপ দাও</small>
        ) : (
          <small>হোম স্ক্রিনে রাখো, অফলাইনেও শেখো ✨</small>
        )}
      </div>
      {!ios && deferred && (
        <button className="btn primary pwa-btn" onClick={install}>ইনস্টল</button>
      )}
      <button className="btn ghost pwa-btn" onClick={dismiss} aria-label="Dismiss">পরে</button>
    </div>
  );
}
