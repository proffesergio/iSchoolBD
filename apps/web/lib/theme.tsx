"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeChoice = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "ischool-theme-v1";

function resolve(choice: ThemeChoice): ResolvedTheme {
  if (choice === "light" || choice === "dark") return choice;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

interface ThemeCtx {
  choice: ThemeChoice;
  resolved: ResolvedTheme;
  setChoice: (c: ThemeChoice) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ choice: "system", resolved: "light", setChoice: () => {}, toggle: () => {} });

export function useTheme(): ThemeCtx {
  return useContext(Ctx);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [choice, setChoiceState] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeChoice | null;
      if (saved === "light" || saved === "dark" || saved === "system") {
        setChoiceState(saved);
        setResolved(resolve(saved));
        return;
      }
    } catch { /* private mode */ }
    setResolved(resolve("system"));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);

  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setResolved(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [choice]);

  const setChoice = useCallback((c: ThemeChoice) => {
    setChoiceState(c);
    setResolved(resolve(c));
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch { /* private mode */ }
  }, []);

  const toggle = useCallback(() => {
    setChoice(resolved === "dark" ? "light" : "dark");
  }, [resolved, setChoice]);

  return <Ctx.Provider value={{ choice, resolved, setChoice, toggle }}>{children}</Ctx.Provider>;
}
