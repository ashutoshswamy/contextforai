"use client";

import { useSyncExternalStore } from "react";

// Tiny localStorage-backed store; memory fallback if storage is blocked.
const mem = new Map<string, string>();
const listeners = new Set<() => void>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? mem.get(key) ?? null;
  } catch {
    return mem.get(key) ?? null;
  }
}

export function writeConsent(key: string, value: string) {
  mem.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** undefined = server/hydrating, null = nothing stored, string = stored value. */
export function useConsent(key: string): string | null | undefined {
  return useSyncExternalStore(subscribe, () => read(key), () => undefined);
}

export const COOKIE_KEY = "cookie-consent:v1";
export const LEGAL_KEY = "legal-consent:v1";
