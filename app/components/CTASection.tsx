"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger);

export default function CTASection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingInnerRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const inner = headingInnerRef.current;
    const sub = subRef.current;
    const cta = ctaRef.current;
    if (!inner) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(inner, { y: 0 });
      gsap.set([sub, cta], { opacity: 1, y: 0 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(inner, { y: "100%" });
      gsap.set([sub, cta], { opacity: 0, y: 12 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(inner, { y: 0, duration: 0.8, ease: "power3.out" })
            .to(sub, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.4")
            .to(cta, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.3");
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 w-full"
    >
      <div className="max-w-5xl mx-auto px-6 text-center">

        {/* Wordmark heading */}
        <div style={{ overflow: "hidden" }} className="mb-6">
          <span
            ref={headingInnerRef}
            className="block text-white font-bold leading-none"
            style={{
              fontSize: "clamp(56px, 10vw, 120px)",
              letterSpacing: "-0.04em",
            }}
          >
            contextforai
          </span>
        </div>

        {/* Tagline */}
        <p
          ref={subRef}
          className="font-mono mb-10"
          style={{ color: "#555", fontSize: "13px" }}
        >
          500 free credits. No credit card required.
        </p>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="flex items-center justify-center gap-4 flex-wrap mb-8"
        >
          <Button
            asChild
            className="gap-2 px-6 py-3 h-auto text-black font-medium hover:opacity-80"
            style={{ backgroundColor: "#FFFFFF", fontSize: "14px", fontWeight: 500 }}
          >
            <a href={isLoggedIn ? "/dashboard" : "/sign-up"}>
              {isLoggedIn ? "Go to dashboard" : "Start building free"}
              <ArrowRight size={14} />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="h-auto p-0 text-sm font-normal hover:underline hover:bg-transparent"
            style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}
          >
            <a
              href="/dashboard/playground"
              onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
            >
              Open playground
            </a>
          </Button>
        </div>

      </div>
    </section>
  );
}
