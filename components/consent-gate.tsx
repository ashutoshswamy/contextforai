"use client";

import { useState, type ReactNode } from "react";
import { LEGAL_VERSION } from "@/lib/legal-version";
import { LEGAL_KEY, useConsent, writeConsent } from "@/lib/consent";

export type LegalConsent = { tosAcceptedAt: string; over18: true; version: string };

/** Blocks the Clerk form until ToS/Privacy are accepted and age 18+ is confirmed. */
export function ConsentGate({ children }: { children: (legal: LegalConsent) => ReactNode }) {
  const stored = useConsent(LEGAL_KEY);
  const [terms, setTerms] = useState(false);
  const [adult, setAdult] = useState(false);

  if (stored === undefined) return <div className="h-64" aria-hidden />;

  if (stored) return <>{children({ tosAcceptedAt: stored, over18: true, version: LEGAL_VERSION })}</>;

  const link = "font-medium text-ink underline underline-offset-4";
  return (
    <div className="border-2 border-bar bg-surface p-6 text-ink">
      <h2 className="font-display text-2xl font-bold tracking-tight">Before you continue</h2>
      <p className="mt-1 text-sm text-muted">Please confirm the following to use contextforai.</p>

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--accent)]" />
        <span>I am 18 years of age or older.</span>
      </label>
      <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--accent)]" />
        <span>
          I agree to the <a href="/terms" target="_blank" rel="noopener" className={link}>Terms of Service</a> and{" "}
          <a href="/privacy" target="_blank" rel="noopener" className={link}>Privacy Policy</a>.
        </span>
      </label>

      <button
        disabled={!(adult && terms)}
        onClick={() => writeConsent(LEGAL_KEY, new Date().toISOString())}
        className="mt-6 h-11 w-full text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: "var(--btn)", color: "var(--btn-ink)" }}
      >
        Continue
      </button>
    </div>
  );
}
