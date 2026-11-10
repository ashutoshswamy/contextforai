"use client";

import { ArrowRight } from "lucide-react";
import { useIsLoggedIn } from "./useIsLoggedIn";

export default function CTASection() {
  const isLoggedIn = useIsLoggedIn();
  return (
    <section className="bg-bg pt-20 lg:pt-28">
      <div className="wall mx-auto max-w-[1400px]">
        <div data-glass="cobalt" data-expand className="pane flex min-h-[22rem] flex-col justify-between gap-12 p-6 sm:p-10 lg:flex-row lg:items-end">
          <h2 className="max-w-3xl font-display text-5xl font-extrabold leading-[1.02] sm:text-6xl xl:text-7xl">Send your first URL today.</h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={isLoggedIn ? "/dashboard" : "/sign-up"}
              data-magnetic className="inline-flex h-12 items-center gap-2 bg-[var(--accent-ink)] px-6 text-base font-semibold text-[var(--accent)] transition-opacity hover:opacity-90"
            >
              {isLoggedIn ? "Go to dashboard" : "Get started free"}
              <ArrowRight size={18} />
            </a>
            <a href="/dashboard/playground" className="text-base font-semibold underline decoration-2 underline-offset-[6px]">
              Open the playground
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
