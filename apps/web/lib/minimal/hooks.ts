"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dropdown state with keyboard accessibility.
 * - `isOpen` / `setIsOpen` naming matches the spec.
 * - Escape closes, focus returns to the trigger.
 * - Click-outside closes.
 */
export function useDropdown(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node | null;
      if (
        t &&
        menuRef.current &&
        triggerRef.current &&
        !menuRef.current.contains(t) &&
        !triggerRef.current.contains(t)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  return { isOpen, setIsOpen, close, triggerRef, menuRef };
}

/**
 * Accordion state for syllabus sections.
 * Clicking a header flips its open/closed state.
 */
export function useAccordion(defaultOpen: string[] = []) {
  const [openSections, setOpenSections] = useState<string[]>(defaultOpen);

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const isSectionOpen = useCallback(
    (id: string) => openSections.includes(id),
    [openSections]
  );

  return { openSections, toggleSection, isSectionOpen, setOpenSections };
}
