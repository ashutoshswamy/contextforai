"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { useIsLoggedIn } from "./useIsLoggedIn";
import BillingCheckout from "@/app/components/dashboard/BillingCheckout";

type Plan = {
  id: string;
  name: string;
  credits: number;
  monthly: string;
  yearly: string;
  rate: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  { id: "free", name: "Free", credits: 500, monthly: "₹0", yearly: "₹0", rate: "20 requests/min (10 for screenshot and branding)" },
  { id: "starter", name: "Starter", credits: 10000, monthly: "₹499", yearly: "₹4,790", rate: "60 requests/min (30 for screenshot and branding)" },
  { id: "growth", name: "Growth", credits: 50000, monthly: "₹999", yearly: "₹9,590", rate: "120 requests/min (60 for screenshot and branding)", popular: true },
  { id: "pro", name: "Pro", credits: 100000, monthly: "₹1,999", yearly: "₹19,190", rate: "180 requests/min (90 for screenshot and branding)" },
];

const n = (x: number) => x.toLocaleString("en-IN");

export default function PricingSection() {
  const isLoggedIn = useIsLoggedIn();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="scroll-mt-14 bg-bg pt-20 lg:pt-28">
      <div className="wall mx-auto max-w-[1400px] sm:grid-cols-2 lg:grid-cols-4">
        <div className="pane flex flex-col gap-6 p-6 sm:col-span-2 sm:p-10 lg:col-span-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">Pay in credits, not seats.</h2>
            <p className="mt-4 text-lg text-muted">Markdown, HTML, JSON, sitemap, and fonts cost 5 credits a call. Screenshot and branding cost 10.</p>
          </div>
          <div role="group" aria-label="Billing cycle" className="inline-flex shrink-0 self-start border-2 border-bar bg-surface lg:self-auto">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                aria-pressed={cycle === c}
                onClick={() => setCycle(c)}
                className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${cycle === c ? "bg-bar text-[#f0f3f5]" : "text-muted hover:text-ink"}`}
              >
                {c}
                {c === "yearly" && <span className="ml-2 text-xs normal-case opacity-80">20% off</span>}
              </button>
            ))}
          </div>
        </div>
        {PLANS.map((plan) => {
          const price = cycle === "yearly" ? plan.yearly : plan.monthly;
          const credits = cycle === "yearly" ? plan.credits * 12 : plan.credits;
          const period = plan.id === "free" ? "forever" : cycle === "yearly" ? "year" : "month";
          const featured = !!plan.popular;
          const buy = featured
            ? "h-12 w-full gap-2 border-2 border-bar bg-bar font-semibold text-[#f0f3f5] hover:opacity-90"
            : "h-12 w-full gap-2 border-2 border-bar bg-transparent font-semibold text-ink hover:bg-raised";
          return (
            <div key={plan.id} className="pane flex flex-col p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                {featured && <span className="bg-bar px-2 py-0.5 text-xs font-bold text-[#f0f3f5]">Popular</span>}
              </div>
              <p className="mt-5 font-display text-5xl font-extrabold">
                {price}
                <span className="ml-1 text-base font-medium text-faint">/{period}</span>
              </p>
              <p className="mt-4">
                <span className="credit-chip">
                  {n(credits)} credits
                </span>
              </p>
              <p className="mt-2 text-sm text-muted">
                {n(Math.floor(credits / 5))} Markdown calls or {n(Math.floor(credits / 10))} screenshots
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm text-muted">
                {["All seven endpoints", plan.rate, ...(plan.id === "growth" || plan.id === "pro" ? ["Priority queue"] : [])].map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {plan.id === "free" ? (
                  <a href="/sign-up" className={`inline-flex items-center justify-center text-sm ${buy}`}>Get started free <ArrowRight size={16} /></a>
                ) : isLoggedIn ? (
                  <BillingCheckout
                    productId={cycle === "yearly" ? `plan_${plan.id}_yearly` : `plan_${plan.id}`}
                    label={`${plan.name} (${cycle})`}
                    priceDisplay={price}
                    credits={credits}
                    className={buy}
                  />
                ) : (
                  <a href="/sign-in?redirect_url=/dashboard/billing" className={`inline-flex items-center justify-center text-sm ${buy}`}>
                    Sign in to purchase <ArrowRight size={16} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
