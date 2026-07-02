import { redis } from "./cache.ts";

// Requests/minute per plan, applies across all keys for that plan.
const PLAN_LIMITS: Record<string, number> = { free: 20, starter: 60, growth: 120, pro: 180 };

// Heavier endpoints (headless browser / CSS fetch fan-out) get half the plan's rate.
const HEAVY_ENDPOINTS = new Set(["screenshot", "branding"]);

const WINDOW_SEC = 60;

export function limitFor(plan: string, endpoint: string): number {
  const base = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  return HEAVY_ENDPOINTS.has(endpoint) ? Math.max(5, Math.floor(base / 2)) : base;
}

async function fixedWindowCheck(
  key: string,
  limit: number
): Promise<{ allowed: boolean; limit: number; remaining: number; resetSec: number }> {
  const bucket = Math.floor(Date.now() / (WINDOW_SEC * 1000));
  const windowKey = `${key}:${bucket}`;

  try {
    const count = await redis.incr(windowKey);
    if (count === 1) await redis.expire(windowKey, WINDOW_SEC);
    const resetSec = (bucket + 1) * WINDOW_SEC - Math.floor(Date.now() / 1000);
    return { allowed: count <= limit, limit, remaining: Math.max(0, limit - count), resetSec };
  } catch {
    // ponytail: fail-open on Redis outage; fixed window (not sliding) allows a 2x burst at
    // the minute boundary — move to Upstash Ratelimit's sliding window if that's ever abused.
    return { allowed: true, limit, remaining: limit, resetSec: WINDOW_SEC };
  }
}

export async function checkRateLimit(
  keyId: number,
  plan: string,
  endpoint: string
): Promise<{ allowed: boolean; limit: number; remaining: number; resetSec: number }> {
  return fixedWindowCheck(`rl:${keyId}:${endpoint}`, limitFor(plan, endpoint));
}

// For session-authenticated dashboard routes (API-key management, billing) that
// aren't tied to a plan tier — keyed by Clerk user id + action, not api_keys.id.
export async function checkUserActionLimit(
  clerkId: string,
  action: string,
  limit: number
): Promise<{ allowed: boolean; limit: number; remaining: number; resetSec: number }> {
  return fixedWindowCheck(`rl:user:${clerkId}:${action}`, limit);
}
