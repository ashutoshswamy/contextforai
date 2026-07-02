"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingCheckout from "@/app/components/dashboard/BillingCheckout";

gsap.registerPlugin(ScrollTrigger);

type Plan = {
  id: string;
  name: string;
  monthlyCredits: number;
  monthlyPrice: string;
  yearlyPrice: string;
  rateLimit: string;
  highlight?: boolean;
};

const FREE = {
  name: "Free",
  price: "₹0",
  credits: 500,
  rateLimit: "20 requests/min (10 for screenshot/branding)",
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyCredits: 10000,
    monthlyPrice: "₹499",
    yearlyPrice: "₹4,790",
    rateLimit: "60 requests/min (30 for screenshot/branding)",
  },
  {
    id: "growth",
    name: "Growth",
    monthlyCredits: 50000,
    monthlyPrice: "₹999",
    yearlyPrice: "₹9,590",
    rateLimit: "120 requests/min (60 for screenshot/branding)",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyCredits: 100000,
    monthlyPrice: "₹1,999",
    yearlyPrice: "₹19,190",
    rateLimit: "180 requests/min (90 for screenshot/branding)",
  },
];

export default function PricingSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([headerRef.current, cardsRef.current], { opacity: 1, y: 0 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(headerRef.current, { opacity: 0, y: 12 });
      gsap.set(cardsRef.current, { opacity: 0, y: 20 });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(headerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
            .to(cardsRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="pricing" className="py-16 md:py-24 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div ref={headerRef} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Simple, credit-based pricing.</h2>
            <p className="text-sm text-muted mt-1">Start free. Upgrade when you need more.</p>
          </div>
          <Tabs value={cycle} onValueChange={(v) => setCycle(v as "monthly" | "yearly")}>
            <TabsList className="h-auto p-0.5 bg-raised">
              <TabsTrigger value="monthly" className="px-3 py-1 text-xs font-mono data-[state=active]:bg-ember data-[state=active]:text-white">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="px-3 py-1 text-xs font-mono gap-1.5 data-[state=active]:bg-ember data-[state=active]:text-white">
                Yearly
                <Badge variant="outline" className="text-[9px] font-mono px-1 py-0 border-go/30 bg-go/10 text-go">20% off</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Free */}
          <Card className="border-border p-5 flex flex-col">
            <CardContent className="p-0 flex flex-col flex-1">
              <p className="font-semibold text-ink mb-1">{FREE.name}</p>
              <p className="text-2xl font-mono font-bold text-ink mb-4">
                {FREE.price}<span className="text-sm font-normal text-faint">/forever</span>
              </p>
              <ul className="space-y-1.5 mb-5 flex-1">
                <li className="flex items-center gap-2 text-sm text-muted">
                  <Check size={13} className="text-ember shrink-0" />
                  {FREE.credits.toLocaleString()} credits/month
                </li>
                <li className="flex items-center gap-2 text-sm text-muted">
                  <Check size={13} className="text-ember shrink-0" />
                  All endpoints
                </li>
                <li className="flex items-center gap-2 text-sm text-muted">
                  <Check size={13} className="text-ember shrink-0" />
                  {FREE.rateLimit}
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full border-border hover:border-ember text-ink">
                <a href="/sign-up">Get started free</a>
              </Button>
            </CardContent>
          </Card>

          {PLANS.map((plan) => {
            const price = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            const credits = cycle === "yearly" ? plan.monthlyCredits * 12 : plan.monthlyCredits;
            const creditsLabel = cycle === "yearly"
              ? `${credits.toLocaleString()} credits/year`
              : `${credits.toLocaleString()} credits/month`;

            return (
              <Card
                key={plan.id}
                className={`p-5 flex flex-col ${plan.highlight ? "border-ember/50 bg-ember/5" : "border-border"}`}
              >
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-ink">{plan.name}</p>
                    {plan.highlight && <Badge className="font-mono bg-ember text-white">Popular</Badge>}
                  </div>
                  <p className="text-2xl font-mono font-bold text-ink mb-4">
                    {price}<span className="text-sm font-normal text-faint">/{cycle === "yearly" ? "year" : "month"}</span>
                  </p>
                  <ul className="space-y-1.5 mb-5 flex-1">
                    <li className="flex items-center gap-2 text-sm text-muted">
                      <Check size={13} className="text-ember shrink-0" />
                      {creditsLabel}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted">
                      <Check size={13} className="text-ember shrink-0" />
                      All endpoints
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted">
                      <Check size={13} className="text-ember shrink-0" />
                      {plan.rateLimit}
                    </li>
                    {plan.id !== "starter" && (
                      <li className="flex items-center gap-2 text-sm text-muted">
                        <Check size={13} className="text-ember shrink-0" />
                        Priority queue
                      </li>
                    )}
                  </ul>
                  {isLoggedIn ? (
                    <BillingCheckout
                      productId={cycle === "yearly" ? `plan_${plan.id}_yearly` : `plan_${plan.id}`}
                      label={`${plan.name} (${cycle})`}
                      priceDisplay={price}
                      credits={credits}
                      className={
                        plan.highlight
                          ? "w-full gap-1.5 bg-ember hover:bg-ember-hi text-white"
                          : "w-full gap-1.5 border border-border hover:border-ember bg-transparent text-ink"
                      }
                    />
                  ) : (
                    <Button
                      asChild
                      className={plan.highlight ? "w-full gap-1.5 bg-ember hover:bg-ember-hi text-white" : "w-full gap-1.5 border border-border hover:border-ember bg-transparent text-ink"}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      <a href="/sign-in?redirect_url=/dashboard/billing">
                        Sign in to purchase <ArrowRight size={14} />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
