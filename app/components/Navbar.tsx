"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    function onScroll() {
      if (window.scrollY > 80) nav!.classList.add("nav-scrolled");
      else nav!.classList.remove("nav-scrolled");
      if (window.scrollY > 50) setMobileOpen(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ transition: "background 150ms ease, border-color 150ms ease" }}
    >
      <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
        <a
          href="/"
          className="font-mono text-sm font-semibold text-white hover:text-white/80 transition-colors"
        >
          contextforai
        </a>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <a href="/docs" className="text-sm text-muted hover:text-ink transition-colors">Docs</a>
          <a href="#endpoints" className="text-sm text-muted hover:text-ink transition-colors">Endpoints</a>
          <a href="#quickstart" className="text-sm text-muted hover:text-ink transition-colors">Quickstart</a>
          <a href="#pricing" className="text-sm text-muted hover:text-ink transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <a href="/dashboard/playground" className="text-sm text-muted hover:text-ink transition-colors">
                  Playground
                </a>
                <Button asChild size="sm" className="gap-1.5 text-black hover:opacity-80 hover:bg-[#F0F0F0]" style={{ backgroundColor: "#F0F0F0" }}>
                  <a href="/dashboard">
                    Dashboard <ArrowRight size={13} />
                  </a>
                </Button>
              </>
            ) : (
              <>
                <a href="/sign-in" className="text-sm text-muted hover:text-ink transition-colors">
                  Sign in
                </a>
                <Button asChild size="sm" className="gap-1.5 text-black hover:opacity-80 hover:bg-[#F0F0F0]" style={{ backgroundColor: "#F0F0F0" }}>
                  <a href="/sign-up">
                    Get started <ArrowRight size={13} />
                  </a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile CTA (condensed) */}
          <Button asChild size="sm" className="sm:hidden gap-1 text-xs text-black hover:bg-[#F0F0F0]" style={{ backgroundColor: "#F0F0F0" }}>
            <a href={isLoggedIn ? "/dashboard" : "/sign-up"}>
              {isLoggedIn ? "Dashboard" : "Get started"}
            </a>
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden text-muted hover:text-ink"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-white/10 bg-bg/95 backdrop-blur-sm px-6 py-4 space-y-0.5">
          <a href="#endpoints" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-muted hover:text-ink transition-colors">
            Endpoints
          </a>
          <a href="#quickstart" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-muted hover:text-ink transition-colors">
            Quickstart
          </a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-muted hover:text-ink transition-colors">
            Pricing
          </a>
          <a href="/docs" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-muted hover:text-ink transition-colors">
            Docs
          </a>
          {isLoggedIn ? (
            <a href="/dashboard/playground" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-muted hover:text-ink transition-colors">
              Playground
            </a>
          ) : (
            <a href="/sign-in" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm text-muted hover:text-ink transition-colors">
              Sign in
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
