"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useIsLoggedIn } from "./useIsLoggedIn";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/#endpoints", label: "Endpoints" },
  { href: "/#quickstart", label: "Quickstart" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`text-base font-semibold transition-opacity hover:opacity-80 ${className}`}>
      contextforai
    </a>
  );
}

export default function Navbar() {
  const isLoggedIn = useIsLoggedIn();
  const [open, setOpen] = useState(false);
  const cta = isLoggedIn ? { href: "/dashboard", label: "Dashboard", short: "Dashboard" } : { href: "/sign-up", label: "Get started free", short: "Get started" };

  return (
    <header className="sticky top-0 z-40 bg-bar text-[#f0f3f5]">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-2">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-[#f0f3f5]/70 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {!isLoggedIn && (
            <a href="/sign-in" className="hidden px-3 text-sm font-medium text-[#f0f3f5]/70 transition-colors hover:text-white sm:inline">
              Sign in
            </a>
          )}
          <a href={cta.href} data-magnetic className="inline-flex h-9 shrink-0 items-center whitespace-nowrap bg-ember px-3 text-sm sm:px-4 font-semibold text-[var(--accent-ink)] transition-colors hover:bg-ember-hi">
            <span className="sm:hidden">{cta.short}</span>
            <span className="hidden sm:inline">{cta.label}</span>
          </a>
          <button
            className="inline-flex size-11 items-center justify-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-white/10 px-4 py-3 md:hidden">
          {[...LINKS, ...(isLoggedIn ? [{ href: "/dashboard/playground", label: "Playground" }] : [{ href: "/sign-in", label: "Sign in" }])].map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-base font-medium">
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
