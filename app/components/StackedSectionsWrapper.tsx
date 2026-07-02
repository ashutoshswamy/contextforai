"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function StackedSectionsWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const panels = gsap.utils.toArray<HTMLElement>(".stacked-panel");
    if (panels.length === 0) return;

    panels.forEach((panel, i) => {
      const isLast = i === panels.length - 1;
      
      if (!isLast) {
        // Pinning the panel (all except the last one)
        ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          pin: true,
          pinSpacing: false,
        });
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full">
      {children}
    </div>
  );
}
