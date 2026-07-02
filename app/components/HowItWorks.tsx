"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const HEADING = "One URL in. Clean data out.";

const ROWS = [
  { method: "POST", path: "/v1/markdown", output: "{...} 847 words, 12 headings" },
  { method: "POST", path: "/v1/fonts",    output: "Inter, Geist Mono, Roboto" },
  { method: "POST", path: "/v1/branding", output: "#1A73E8, #202124  logo.svg" },
];

function Chars({ text }: { text: string }) {
  const words = text.split(" ").map((word, wi) => (
    <span key={wi} className="inline-block whitespace-nowrap">
      {word.split("").map((ch, ci) => (
        <span key={ci} className="hiw-char inline-block">
          {ch}
        </span>
      ))}
    </span>
  ));

  return <>{words.flatMap((word, i) => (i === 0 ? [word] : [" ", word]))}</>;
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const headingChars = root.querySelectorAll(".hiw-heading .hiw-char");
      const rows = root.querySelectorAll<HTMLElement>(".hiw-row");
      const progress = root.querySelector(".hiw-progress");
      const stats = root.querySelector(".hiw-stats");

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(headingChars, { opacity: 1 });
        gsap.set(rows, { x: 0, opacity: 1 });
        rows.forEach((row) => {
          gsap.set(row.querySelectorAll(".hiw-cursor"), { opacity: 0 });
          gsap.set(row.querySelectorAll(".hiw-out .hiw-char"), { opacity: 1 });
        });
        gsap.set(progress, { scaleX: 1 });
        if (stats) gsap.set(stats, { opacity: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(headingChars, { opacity: 0 });
        gsap.set(rows, { x: -8, opacity: 0 });
        gsap.set(progress, { scaleX: 0, transformOrigin: "left" });

        const tl = gsap.timeline({ paused: true });

        tl.to(headingChars, { opacity: 1, duration: 0.25, stagger: 0.02, ease: "none" }, 0);

        rows.forEach((row, i) => {
          const cursor = row.querySelectorAll(".hiw-cursor");
          const outChars = row.querySelectorAll(".hiw-out .hiw-char");
          gsap.set(outChars, { opacity: 0 });
          gsap.set(cursor, { opacity: 0 });

          const start = 0.5 + i * 0.15;
          const blinkStart = start + 0.35;
          const typeStart = blinkStart + 0.6;

          tl.to(row, { x: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, start)
            .to(cursor, { opacity: 1, duration: 0.1, repeat: 5, yoyo: true, ease: "none" }, blinkStart)
            .to(outChars, { opacity: 1, duration: 0.12, stagger: 0.012, ease: "none" }, typeStart);
        });

        tl.to(progress, { scaleX: 1, duration: 0.4, ease: "power2.out" }, ">-0.1");
        if (stats) tl.to(stats, { opacity: 1, duration: 0.3, ease: "power2.out" }, ">+0.2");

        ScrollTrigger.create({
          trigger: root,
          start: "top 65%",
          once: true,
          onEnter: () => tl.play(),
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-16 md:py-24 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-16">
        <div>
          <h2 className="hiw-heading font-mono text-[28px] font-semibold tracking-tight text-ink mb-5 leading-tight">
            <Chars text={HEADING} />
          </h2>
          <p className="text-sm text-ink/50 leading-relaxed max-w-sm">
            POST a URL to any endpoint. We fetch, extract, and return structured data — most responses under 2 seconds.
          </p>
        </div>

        <div className="relative">
          <div className="space-y-4 sm:space-y-5">
            {ROWS.map((row) => (
              <div
                key={row.path}
                className="hiw-row flex flex-wrap items-baseline gap-x-2 font-mono text-[13px] sm:text-sm"
              >
                <span className="text-ink/40">$</span>
                <span className="text-ink/80">{row.method}</span>
                <span className="text-ink">{row.path}</span>
                <ArrowRight size={12} className="text-ink/30 shrink-0" />
                <div className="hiw-cursor w-2 h-3.5 bg-ink/25 inline-block shrink-0 translate-y-0.5" />
                <span className="hiw-out text-muted">
                  <Chars text={row.output} />
                </span>
              </div>
            ))}
          </div>
          <div className="hiw-progress mt-8 h-px w-full origin-left" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
          <p className="hiw-stats mt-4 text-xs font-mono text-faint" style={{ opacity: 0 }}>
            {"< 2s avg response  ·  99.9% uptime  ·  6 endpoints"}
          </p>
        </div>
      </div>
    </section>
  );
}
