import crypto from "crypto";
import { NextRequest } from "next/server";
import sql from "@/lib/db";

export async function POST(request: NextRequest) {
  const sig = request.headers.get("x-razorpay-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const body = await request.text();
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const sigBuf = Buffer.from(sig, "hex");
  if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);
  if (event.event !== "payment.captured") return new Response("OK");

  const paymentId: string = event.payload.payment.entity.id;
  const orderId: string = event.payload.payment.entity.order_id;

  await fulfillOrder(orderId, paymentId);
  return new Response("OK");
}

async function fulfillOrder(orderId: string, paymentId: string) {
  const [order] = await sql`
    SELECT * FROM orders WHERE id = ${orderId} AND status = 'pending'
  `;
  if (!order) return;

  await sql`
    UPDATE orders SET status = 'paid', razorpay_payment_id = ${paymentId}, paid_at = NOW()
    WHERE id = ${orderId}
  `;

  const userId = order.user_id as number;
  const credits = order.credits as number;
  const productId = order.product_id as string;

  if (productId.startsWith("plan_")) {
    const isYearly = productId.endsWith("_yearly");
    const plan = productId.replace("plan_", "").replace("_yearly", "");
    const monthlyCredits = isYearly ? Math.round(credits / 12) : credits;
    const cycleDays = isYearly ? 365 : 30;
    await sql`
      UPDATE user_plans
      SET plan = ${plan}, credits_balance = ${credits}, credits_monthly = ${monthlyCredits},
          cycle_reset_at = NOW() + (${cycleDays} * INTERVAL '1 day'), updated_at = NOW()
      WHERE user_id = ${userId}
    `;
  } else {
    // Topups last 30 days from purchase. If the existing pool already expired,
    // it's discarded (not added to) before granting the new batch.
    await sql`
      UPDATE user_plans
      SET
        topup_balance = (CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END) + ${credits},
        topup_expires_at = NOW() + INTERVAL '30 days',
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;
  }
}
