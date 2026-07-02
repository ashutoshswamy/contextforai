import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import sql from "@/lib/db";
import { checkUserActionLimit } from "@/lib/ratelimit";

const PRODUCTS: Record<string, { credits: number; amount: number; label: string }> = {
  plan_starter: { credits: 10000, amount: 49900, label: "Starter Plan" },
  plan_growth: { credits: 50000, amount: 99900, label: "Growth Plan" },
  plan_pro: { credits: 100000, amount: 199900, label: "Pro Plan" },
  // Yearly: 12mo of credits upfront, 20% off 12x the monthly price.
  plan_starter_yearly: { credits: 120000, amount: 479000, label: "Starter Plan (Yearly)" },
  plan_growth_yearly: { credits: 600000, amount: 959000, label: "Growth Plan (Yearly)" },
  plan_pro_yearly: { credits: 1200000, amount: 1919000, label: "Pro Plan (Yearly)" },
  topup_500: { credits: 500, amount: 2500, label: "500 Credits" },
  topup_2000: { credits: 2000, amount: 9900, label: "2,000 Credits" },
  topup_10000: { credits: 10000, amount: 49900, label: "10,000 Credits" },
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkUserActionLimit(clerkId, "billing:create-order", 10);
  if (!rl.allowed) {
    return Response.json(
      { error: "RATE_LIMITED", message: "Too many requests. Slow down." },
      { status: 429, headers: { "Retry-After": String(rl.resetSec) } }
    );
  }

  const body = await request.json().catch(() => ({}));
  const productId = body.productId;
  if (typeof productId !== "string") {
    return Response.json({ error: "Invalid product" }, { status: 400 });
  }
  const product = PRODUCTS[productId];
  if (!product) return Response.json({ error: "Invalid product" }, { status: 400 });

  const [user] = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const order = await razorpay.orders.create({
    amount: product.amount,
    currency: "INR",
    receipt: `${productId}_${Date.now()}`,
    notes: { productId, clerkId },
  });

  // Store order for webhook fulfilment
  await sql`
    INSERT INTO orders (id, user_id, product_id, credits, amount)
    VALUES (${order.id}, ${user.id as number}, ${productId}, ${product.credits}, ${product.amount})
  `;

  return Response.json({
    orderId: order.id,
    amount: product.amount,
    currency: "INR",
    label: product.label,
  });
}
