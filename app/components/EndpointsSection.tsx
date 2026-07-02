"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(ScrollTrigger);

const ENDPOINTS = [
  {
    id: "markdown",
    path: "/v1/markdown",
    description: "Strips nav, ads, and footers. Returns clean Markdown ready for LLM ingestion.",
    cost: 5,
  },
  {
    id: "html",
    path: "/v1/html",
    method: "GET" as const,
    description: "Raw HTML of the page, fetched server-side. No parsing or extraction.",
    cost: 5,
  },
  {
    id: "json",
    path: "/v1/json",
    description: "Structured page data — title, meta tags, OpenGraph, headings, and outbound links.",
    cost: 5,
  },
  {
    id: "sitemap",
    path: "/v1/sitemap",
    description: "Full URL list from sitemap.xml. Falls back to shallow crawl if no sitemap exists.",
    cost: 5,
  },
  {
    id: "fonts",
    path: "/v1/fonts",
    description: "Detected font families from CSS declarations, Google Fonts links, and style blocks.",
    cost: 5,
  },
  {
    id: "screenshot",
    path: "/v1/screenshot",
    description: "Full-page or above-the-fold PNG/JPEG via headless Chromium.",
    cost: 10,
  },
  {
    id: "branding",
    path: "/v1/branding",
    description: "Logo URL, favicon, and primary brand color palette extracted from CSS.",
    cost: 10,
  },
];

export default function EndpointsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const costRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(() => {
    const header = headerRef.current;
    const rows = rowRefs.current.filter(Boolean) as HTMLDivElement[];

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      if (header) gsap.set(header, { opacity: 1, y: 0 });
      gsap.set(rows, { clipPath: "inset(0 0 0% 0)" });
      costRefs.current.forEach((el, i) => {
        if (el) el.textContent = `${ENDPOINTS[i].cost} cr`;
      });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (header) gsap.set(header, { opacity: 0, y: 12 });
      gsap.set(rows, { clipPath: "inset(0 0 100% 0)" });
      costRefs.current.forEach((el) => { if (el) el.textContent = "0 cr"; });

      const tl = gsap.timeline({ paused: true });

      if (header) tl.to(header, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      tl.to(rows, { clipPath: "inset(0 0 0% 0)", duration: 0.4, stagger: 0.07, ease: "power2.out" }, ">");

      tl.addLabel("counters", ">");
      ENDPOINTS.forEach((ep, i) => {
        const el = costRefs.current[i];
        if (!el) return;
        const c = { v: 0 };
        tl.to(c, {
          v: ep.cost,
          duration: 0.6,
          ease: "power1.out",
          onUpdate() { el.textContent = `${Math.round(c.v)} cr`; },
        }, "counters");
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        once: true,
        onEnter: () => tl.play(),
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="endpoints" className="py-16 md:py-24 w-full bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div
          ref={headerRef}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Seven endpoints. One key.
            </h2>
          </div>
          <Button
            asChild
            variant="link"
            className="gap-1 text-xs font-mono underline underline-offset-4 shrink-0 text-muted hover:text-ember h-auto p-0"
          >
            <a href="/docs">
              Full reference <ArrowUpRight size={11} />
            </a>
          </Button>
        </div>

        {/* Endpoint list */}
        <div>
          {ENDPOINTS.map((ep, i) => (
            <div
              key={ep.path}
              ref={(el) => { rowRefs.current[i] = el; }}
              className={`group flex flex-col sm:flex-row sm:items-start sm:gap-6 py-6 px-4 -mx-4 rounded-lg transition-colors hover:bg-white/5 ${i > 0 ? "border-t border-border" : ""}`}
            >
              {/* Path + badge + mobile cost */}
              <div className="flex items-center gap-3 sm:w-[240px] sm:shrink-0 mb-1.5 sm:mb-0">
                <a
                  href={`/docs#${ep.id}`}
                  className="font-mono text-sm font-bold text-ink transition-colors hover:text-ember"
                >
                  {ep.path}
                </a>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono shrink-0 rounded-none text-faint border-border"
                >
                  {ep.method ?? "POST"}
                </Badge>
                <span
                  className={`sm:hidden ml-auto text-xs font-mono font-semibold tabular-nums ${ep.cost >= 10 ? "text-amber" : "text-ink"}`}
                >
                  {ep.cost} cr
                </span>
              </div>

              {/* Description */}
              <p className="flex-1 text-sm leading-relaxed text-muted">
                {ep.description}
              </p>

              {/* Right: cost + docs link (desktop only) */}
              <div className="hidden sm:flex items-center gap-4 shrink-0">
                <span
                  ref={(el) => { costRefs.current[i] = el; }}
                  className={`text-xs font-mono font-semibold tabular-nums ${ep.cost >= 10 ? "text-amber" : "text-ink"}`}
                >
                  {ep.cost} cr
                </span>
                <a
                  href={`/docs#${ep.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-faint hover:text-ember"
                  aria-label={`Docs for ${ep.path}`}
                >
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className="mt-6 pt-5 text-xs font-mono text-faint border-t border-border">
          Errors are never charged.
        </p>
      </div>
    </section>
  );
}
