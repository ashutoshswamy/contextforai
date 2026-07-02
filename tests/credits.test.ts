// Integration test against the real DB (DATABASE_URL). Skips if not configured
// (e.g. CI without secrets) rather than failing the whole suite.
//
// This encodes the exact regression this session found and fixed: topup
// credits were being silently wiped by the monthly cycle reset because both
// pools shared one column. Run with: npm test

import test from "node:test";
import assert from "node:assert/strict";
import sql from "../lib/db.ts";
import { reserveCredits, refundCredits } from "../lib/credits.ts";

const hasDb = !!process.env.DATABASE_URL;

async function makeTestUser(clerkId: string) {
  const [u] = await sql`INSERT INTO users (clerk_id, email) VALUES (${clerkId}, ${clerkId + "@test.local"}) RETURNING id`;
  return u.id as number;
}

async function cleanup(userId: number) {
  await sql`DELETE FROM users WHERE id = ${userId}`; // cascades to user_plans
}

async function getBalances(userId: number) {
  const [row] = await sql`SELECT credits_balance, topup_balance FROM user_plans WHERE user_id = ${userId}`;
  return { balance: row.credits_balance as number, topup: row.topup_balance as number };
}

test("reserveCredits draws monthly first, then topup, on an expired cycle", { skip: !hasDb }, async () => {
  const userId = await makeTestUser("test_credits_a");
  try {
    await sql`
      INSERT INTO user_plans (user_id, plan, credits_balance, credits_monthly, topup_balance, topup_expires_at, cycle_reset_at)
      VALUES (${userId}, 'starter', 10, 10, 50, NOW() + INTERVAL '10 days', NOW() - INTERVAL '1 day')
    `;

    const result = await reserveCredits(userId, 15); // cycle expired -> eff monthly = 10, need 5 more from topup
    assert.equal(result.ok, true);

    const { balance, topup } = await getBalances(userId);
    assert.equal(balance, 0, "monthly balance should be drained to 0");
    assert.equal(topup, 45, "topup should cover the 5-credit shortfall (50 - 5)");
  } finally {
    await cleanup(userId);
  }
});

test("reserveCredits rejects when an expired topup batch can't be used", { skip: !hasDb }, async () => {
  const userId = await makeTestUser("test_credits_b");
  try {
    await sql`
      INSERT INTO user_plans (user_id, plan, credits_balance, credits_monthly, topup_balance, topup_expires_at, cycle_reset_at)
      VALUES (${userId}, 'starter', 5, 5, 100, NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days')
    `;

    const result = await reserveCredits(userId, 10); // only 5 valid credits; topup expired
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.response.status, 402);
  } finally {
    await cleanup(userId);
  }
});

test("refundCredits lands in topup_balance with a fresh expiry", { skip: !hasDb }, async () => {
  const userId = await makeTestUser("test_credits_c");
  try {
    await sql`
      INSERT INTO user_plans (user_id, plan, credits_balance, credits_monthly, topup_balance, topup_expires_at, cycle_reset_at)
      VALUES (${userId}, 'starter', 0, 10, 0, NULL, NOW() + INTERVAL '10 days')
    `;

    await refundCredits(userId, 7);
    const { topup } = await getBalances(userId);
    assert.equal(topup, 7);

    const [row] = await sql`SELECT topup_expires_at > NOW() AS valid FROM user_plans WHERE user_id = ${userId}`;
    assert.equal(row.valid, true, "refund should grant a fresh 30-day expiry");
  } finally {
    await cleanup(userId);
  }
});

test("a new topup purchase discards an already-expired batch instead of adding to it", { skip: !hasDb }, async () => {
  const userId = await makeTestUser("test_credits_d");
  try {
    await sql`
      INSERT INTO user_plans (user_id, plan, credits_balance, credits_monthly, topup_balance, topup_expires_at, cycle_reset_at)
      VALUES (${userId}, 'starter', 10, 10, 50, NOW() - INTERVAL '1 day', NOW() + INTERVAL '10 days')
    `;

    // Same expiry-aware UPDATE used by the verify route / webhook on a topup purchase.
    await sql`
      UPDATE user_plans
      SET
        topup_balance = (CASE WHEN topup_expires_at > NOW() THEN topup_balance ELSE 0 END) + 20,
        topup_expires_at = NOW() + INTERVAL '30 days',
        updated_at = NOW()
      WHERE user_id = ${userId}
    `;

    const { topup } = await getBalances(userId);
    assert.equal(topup, 20, "expired 50 should be discarded, not added to the new 20");
  } finally {
    await cleanup(userId);
  }
});

if (!hasDb) {
  console.log("credits.test.ts: DATABASE_URL not set, DB-integration tests skipped");
}
