"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open(): void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function BillingCheckout({
  productId,
  label,
  priceDisplay,
  credits,
  className = "",
}: {
  productId: string;
  label: string;
  priceDisplay: string;
  credits: number;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleBuy() {
    setLoading(true);
    setError(null);

    try {
      await loadRazorpayScript();

      const res = await fetch("/api/user/billing/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const { orderId, amount, currency } = await res.json();

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount,
        currency,
        order_id: orderId,
        name: "contextforai",
        description: `${label} — ${credits.toLocaleString()} credits`,
        theme: { color: "#FF4F00" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch("/api/user/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const result = await verify.json();
          if (result.success) {
            router.refresh();
          } else {
            setError("Payment verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });

      rzp.open();
    } catch {
      setError("Payment failed. Try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant="ghost"
        onClick={handleBuy}
        disabled={loading}
        className={`${className} h-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
      >
        {loading ? "Opening…" : `Buy ${priceDisplay}`}
      </Button>
      {error && <p className="text-xs text-stop mt-1">{error}</p>}
    </div>
  );
}
