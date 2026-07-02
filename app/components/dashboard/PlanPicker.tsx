"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import BillingCheckout from "@/app/components/dashboard/BillingCheckout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Plan = {
  id: string;
  name: string;
  monthlyCredits: number;
  monthlyPrice: string;
  yearlyPrice: string;
  rateLimit: string;
  highlight?: boolean;
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

export default function PlanPicker({ currentPlan }: { currentPlan: string }) {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono text-faint uppercase tracking-widest">Plans</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const productId = cycle === "yearly" ? `plan_${plan.id}_yearly` : `plan_${plan.id}`;
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
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-ink">{plan.name}</p>
                    <p className="text-2xl font-mono font-bold text-ink mt-1">
                      {price}
                      <span className="text-sm font-normal text-faint">/{cycle === "yearly" ? "year" : "month"}</span>
                    </p>
                  </div>
                  {plan.highlight && (
                    <Badge className="font-mono bg-ember text-white">Popular</Badge>
                  )}
                </div>
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
                {isCurrent ? (
                  <div className="w-full py-2 text-sm font-mono text-center text-faint bg-raised rounded-lg border border-border">
                    Current plan
                  </div>
                ) : (
                  <BillingCheckout
                    productId={productId}
                    label={`${plan.name} (${cycle})`}
                    priceDisplay={price}
                    credits={credits}
                    className={`w-full py-2 text-sm font-mono rounded-lg transition-colors ${
                      plan.highlight
                        ? "bg-ember hover:bg-ember-hi text-white"
                        : "bg-surface border border-border hover:border-ember text-ink"
                    }`}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
