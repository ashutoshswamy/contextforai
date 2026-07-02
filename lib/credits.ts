import sql from "./db.ts";

export async function reserveCredits(
  userId: number,
  cost: number
): Promise<{ ok: true } | { ok: false; response: Response }> {
  if (cost === 0) return { ok: true };

  // Monthly credits reset to credits_monthly each cycle and don't roll over.
  // topup_balance is a separate pool, drawn from only after the monthly
  // allotment is exhausted — but it expires 30 days after it was granted
  // (topup_expires_at), same as monthly credits don't survive past their cycle.
  const rows = await sql`
    WITH cur AS (
      SELECT
        CASE WHEN cycle_reset_at <= NOW() THEN credits_monthly ELSE credits_balance END AS eff_balance,
        CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END AS eff_topup,
        cycle_reset_at
      FROM user_plans
      WHERE user_id = ${userId}
      FOR UPDATE
    )
    UPDATE user_plans up
    SET
      credits_balance = GREATEST(cur.eff_balance - ${cost}, 0),
      topup_balance = GREATEST(cur.eff_topup - GREATEST(${cost} - cur.eff_balance, 0), 0),
      cycle_reset_at = CASE
        WHEN cur.cycle_reset_at <= NOW() THEN NOW() + INTERVAL '30 days'
        ELSE cur.cycle_reset_at
      END,
      updated_at = NOW()
    FROM cur
    WHERE up.user_id = ${userId}
      AND (cur.eff_balance + cur.eff_topup) >= ${cost}
    RETURNING up.credits_balance, up.topup_balance
  `;

  if (rows.length === 0) {
    const [plan] = await sql`
      SELECT
        CASE WHEN cycle_reset_at <= NOW() THEN credits_monthly ELSE credits_balance END
        + CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END AS balance
      FROM user_plans WHERE user_id = ${userId}
    `;
    const balance = (plan?.balance as number) ?? 0;
    return {
      ok: false,
      response: Response.json(
        {
          error: "INSUFFICIENT_CREDITS",
          message: `This request costs ${cost} credits; balance is ${balance}.`,
          balance,
          required: cost,
        },
        { status: 402 }
      ),
    };
  }

  return { ok: true };
}

export async function refundCredits(userId: number, cost: number): Promise<void> {
  if (cost === 0) return;
  // Refund into topup_balance, resetting its 30-day expiry — a refund is
  // effectively a fresh grant, not an extension of a possibly-expired batch.
  await sql`
    UPDATE user_plans
    SET
      topup_balance = (CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END) + ${cost},
      topup_expires_at = NOW() + INTERVAL '30 days',
      updated_at = NOW()
    WHERE user_id = ${userId}
  `;
}
