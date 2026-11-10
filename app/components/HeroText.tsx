"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useIsLoggedIn } from "./useIsLoggedIn";
import { LINES } from "./landing/lines";

export default function HeroText() {
  const isLoggedIn = useIsLoggedIn();
  const [id, setId] = useState(LINES[0].id);
  const line = LINES.find((l) => l.id === id)!;
  const section = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Feedback: a new endpoint slides its response into the pane.
  useGSAP(
    () => {
      if (first.current) { first.current = false; return; }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo("[data-resp]", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", stagger: 0.05 });
    },
    { dependencies: [id], scope: section }
  );

  return (
    <section ref={section} className="bg-bg pt-3 sm:pt-6">
      <div data-hero className="wall mx-auto max-w-[1400px] grid-cols-2 md:grid-cols-8 lg:grid-cols-7">
        {/* Headline pane */}
        <div className="pane rise order-1 col-span-2 md:col-span-8 flex min-h-[18rem] flex-col justify-end p-6 sm:p-10 lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:min-h-[22rem]">
          <h1 className="font-display text-[2.75rem] font-extrabold leading-[1.02] sm:text-6xl xl:text-7xl">
            <span className="block overflow-hidden pb-1"><span data-line className="block">Any page in.</span></span>
            <span className="block overflow-hidden pb-1"><span data-line className="block">Clean data out.</span></span>
            <span className="sr-only">: web extraction API for Markdown, JSON and screenshots</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            One API key turns a URL into Markdown, JSON, a sitemap, a screenshot, fonts, or brand assets.
          </p>
        </div>

        {/* Primary action: the cobalt pane */}
        <div data-glass="cobalt" className="pane order-2 col-span-2 md:col-span-8 flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-10 lg:col-span-4 lg:col-start-1 lg:row-start-2">
          <div>
            <p className="font-display text-2xl font-bold">Start with 500 free credits.</p>
            <p className="mt-1 opacity-80">No credit card required.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={isLoggedIn ? "/dashboard/playground" : "/sign-up"}
              data-magnetic className="inline-flex h-12 items-center gap-2 bg-[var(--accent-ink)] px-6 text-base font-semibold text-[var(--accent)] transition-opacity hover:opacity-90"
            >
              {isLoggedIn ? "Open playground" : "Get started free"}
              <ArrowRight size={18} />
            </a>
            <a href="/docs" className="text-base font-semibold underline decoration-2 underline-offset-[6px]">
              Read the docs
            </a>
          </div>
        </div>

        {/* Response pane */}
        <div className="pane order-4 col-span-2 md:col-span-8 flex min-h-[20rem] flex-col lg:order-3 lg:col-span-3 lg:col-start-5 lg:row-span-2 lg:row-start-1">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <span data-resp className="font-display text-lg font-bold">{line.method} {line.path}</span>
            <span className="inline-flex h-6 items-center bg-[var(--go)] px-2 text-xs font-bold text-[var(--bg)]">200 OK</span>
          </div>
          <p className="px-5 pt-4 text-sm font-semibold">Example response for example.com</p>
          <pre data-resp className="min-w-0 overflow-auto whitespace-pre-wrap [overflow-wrap:anywhere] px-5 pb-5 pt-2 text-[0.95rem] leading-relaxed no-scrollbar" aria-live="polite">{line.sample}</pre>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border bg-raised px-5 py-4">
            <span className="text-sm text-muted">Charged for this call</span>
            <span className="credit-chip">{line.cost} credits</span>
          </div>
        </div>

        {/* Endpoint panes: pick one, it lights */}
        {LINES.map((l, i) => (
          <button
            key={l.id}
            data-glass={l.id === id ? "cobalt" : undefined}
            aria-pressed={l.id === id}
            onClick={() => setId(l.id)}
            className={`pane order-3 flex flex-col justify-between gap-6 p-4 text-left lg:order-4 lg:col-span-1 lg:row-start-3 lg:min-h-28 ${i === LINES.length - 1 ? "col-span-2 md:col-span-4" : "md:col-span-2"}`}
          >
            <span className="font-display text-lg font-bold">{l.name}</span>
            <span className="text-sm font-medium opacity-80">{l.cost} credits</span>
          </button>
        ))}
      </div>
    </section>
  );
}
