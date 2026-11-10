"use client";

import { COOKIE_KEY, useConsent, writeConsent } from "@/lib/consent";

export function CookieConsent() {
  const choice = useConsent(COOKIE_KEY);
  if (choice !== null) return null; // hydrating or already answered

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 border-2 border-bar bg-surface p-5 text-ink shadow-[0_8px_30px_rgb(0_0_0/0.25)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-sm"
    >
      <p className="font-display text-base font-bold">Cookies</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        We use essential cookies to keep you signed in. No ads, no third-party tracking. See our{" "}
        <a href="/privacy" className="font-medium text-ink underline underline-offset-4">Privacy Policy</a>.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => writeConsent(COOKIE_KEY, "all")}
          className="h-9 px-4 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--btn)", color: "var(--btn-ink)" }}
        >
          Accept all
        </button>
        <button
          onClick={() => writeConsent(COOKIE_KEY, "essential")}
          className="h-9 border-2 border-bar px-4 text-sm font-semibold transition-colors hover:bg-raised"
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
