"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * One motion layer for the landing wall. Motion has a job each time:
 *  - hero intro: glass panes slide into the frame (assembly = story)
 *  - hero recede: the wall pulls back as you leave it (depth, hierarchy)
 *  - batch reveal: each bay arrives as you reach it (pacing)
 *  - amber backlight: costly panes light on arrival (price emphasis)
 *  - CTA expand: the closing pane grows to fill the frame (resolution)
 *  - hover flood + magnetic CTAs (feedback)
 * All of it is behind prefers-reduced-motion: no-preference. Content is visible otherwise.
 */
export default function LandingMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const heroWall = root.current!.querySelector<HTMLElement>(".wall[data-hero]");
        const heroPanes = gsap.utils.toArray<HTMLElement>(".wall[data-hero] .pane");
        const lines = gsap.utils.toArray<HTMLElement>("[data-line]");

        // Hero intro
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.fromTo(
          heroPanes,
          { opacity: 0, y: 40, clipPath: "inset(0% 0% 100% 0%)" },
          { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, stagger: { each: 0.07, from: "start" }, clearProps: "clipPath,transform" },
          0
        ).fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 1.05, stagger: 0.12 }, 0.3);

        // Hero recedes as you scroll past it
        if (heroWall) {
          gsap.to(heroWall, {
            scale: 0.94,
            yPercent: 4,
            transformOrigin: "50% 100%",
            ease: "none",
            scrollTrigger: { trigger: heroWall, start: "top top", end: "bottom top", scrub: true },
          });
        }

        // Each bay arrives as it enters
        const panes = gsap.utils.toArray<HTMLElement>(".wall:not([data-hero]) .pane:not([data-expand])");
        gsap.set(panes, { y: 56 });
        ScrollTrigger.batch(panes, {
          start: "top 90%",
          once: true,
          onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.09, overwrite: true }),
        });

        // Amber panes light from behind when they arrive
        gsap.utils.toArray<HTMLElement>(".pane[data-glass='amber']").forEach((el) => {
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () => gsap.to(el, { "--lit": 1, duration: 1.3, delay: 0.25, ease: "power2.inOut" }),
          });
        });

        // Closing pane grows to fill the frame
        const cta = root.current!.querySelector<HTMLElement>("[data-expand]");
        if (cta) {
          gsap.set(cta, { opacity: 1 });
          gsap.fromTo(
            cta,
            { clipPath: "inset(16% 9% 16% 9%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: cta, start: "top 96%", end: "top 38%", scrub: true } }
          );
        }
      });

      // Hover feedback only where there is a hover
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const cleanups: Array<() => void> = [];

        root.current!.querySelectorAll<HTMLElement>("a.pane, button.pane").forEach((el) => {
          const arrow = el.querySelector<HTMLElement>("[data-arrow]");
          const over = () => {
            gsap.to(el, { "--flood": 1, duration: 0.6, ease: "expo.out", overwrite: "auto" });
            if (arrow) gsap.to(arrow, { x: 4, y: -4, duration: 0.4, ease: "expo.out" });
          };
          const out = () => {
            gsap.to(el, { "--flood": 0, duration: 0.45, ease: "expo.out", overwrite: "auto" });
            if (arrow) gsap.to(arrow, { x: 0, y: 0, duration: 0.4, ease: "expo.out" });
          };
          el.addEventListener("pointerenter", over);
          el.addEventListener("pointerleave", out);
          cleanups.push(() => {
            el.removeEventListener("pointerenter", over);
            el.removeEventListener("pointerleave", out);
            gsap.set(el, { "--flood": 0 });
            if (arrow) gsap.set(arrow, { x: 0, y: 0 });
          });
        });

        // Magnetic primary actions
        root.current!.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
          const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
          const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            qx(gsap.utils.clamp(-10, 10, (e.clientX - (r.left + r.width / 2)) * 0.22));
            qy(gsap.utils.clamp(-6, 6, (e.clientY - (r.top + r.height / 2)) * 0.22));
          };
          const leave = () => { qx(0); qy(0); };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
            gsap.set(el, { x: 0, y: 0 });
          });
        });

        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="m-init">
      {children}
      <noscript>
        <style>{`.m-init .pane{opacity:1 !important}.m-init .pane[data-glass="amber"]{--lit:1 !important}`}</style>
      </noscript>
    </div>
  );
}
