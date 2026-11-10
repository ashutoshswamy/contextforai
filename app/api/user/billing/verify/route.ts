import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import sql from "@/lib/db";
import { checkUserActionLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkUserActionLimit(clerkId, "billing:verify", 20);
  if (!rl.allowed) {
    return Response.json(
      { error: "RATE_LIMITED", message: "Too many requests. Slow down." },
      { status: 429, headers: { "Retry-After": String(rl.resetSec) } }
    );
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await request.json().catch(() => ({}));

  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string"
  ) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Verify Razorpay signature
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const sigBuf = Buffer.from(razorpay_signature, "hex");
  if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
    return Response.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Fulfil order (idempotent - webhook may also fire)
  const [order] = await sql`
    SELECT * FROM orders WHERE id = ${razorpay_order_id} AND status = 'pending'
  `;
  if (!order) return Response.json({ success: true }); // already fulfilled by webhook

  await sql`
    UPDATE orders
    SET status = 'paid', razorpay_payment_id = ${razorpay_payment_id}, paid_at = NOW()
    WHERE id = ${razorpay_order_id}
  `;

  const userId = order.user_id as number;
  const credits = order.credits as number;
  const productId = order.product_id as string;

  if (productId.startsWith("plan_")) {
    const isYearly = productId.endsWith("_yearly");
    const plan = productId.replace("plan_", "").replace("_yearly", "");
    // Yearly: pay once for 12mo of credits upfront; credits_monthly stays the normal
    // monthly figure so the cadence falls back to monthly if the year lapses unrenewed.
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

  return Response.json({ success: true });
}
