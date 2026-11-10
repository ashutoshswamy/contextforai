"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { Card, CardContent } from "@/components/ui/card";

export default function AnimatedStat({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon?: ReactNode;
}) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: "power2.out",
      onUpdate() {
        if (numRef.current) {
          numRef.current.textContent = Math.round(obj.val).toLocaleString();
        }
      },
    });
  }, [value]);

  return (
    <Card className="border-border p-5 gap-0">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-muted ">{label}</p>
          {icon && <span className="text-ember">{icon}</span>}
        </div>
        <p className="text-2xl font-mono font-bold text-ink">
          <span ref={numRef}>0</span>
        </p>
        <p className="text-xs text-faint mt-0.5">{unit}</p>
      </CardContent>
    </Card>
  );
}
