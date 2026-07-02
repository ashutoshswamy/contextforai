import crypto from "crypto";
import sql from "./db.ts";
import { checkRateLimit } from "./ratelimit.ts";
import { ERR } from "./errors.ts";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = "cfai_" + crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 13); // cfai_XXXXXXXX
  return { key, hash, prefix };
}

export function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export type AuthResult =
  | { valid: true; userId: number; keyId: number; plan: string }
  | { valid: false; response: Response };

export async function validateApiKey(request: Request, endpoint: string): Promise<AuthResult> {
  const auth = request.headers.get("authorization") ?? "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!key) return { valid: false, response: ERR.unauthorized() };

  const hash = hashKey(key);
  const rows = await sql`
    SELECT k.id, k.user_id, COALESCE(p.plan, 'free') AS plan
    FROM api_keys k
    LEFT JOIN user_plans p ON p.user_id = k.user_id
    WHERE k.key_hash = ${hash} AND k.is_active = true
    LIMIT 1
  `;

  if (rows.length === 0) return { valid: false, response: ERR.unauthorized() };

  const keyId = rows[0].id as number;
  const userId = rows[0].user_id as number;
  const plan = rows[0].plan as string;

  // non-blocking — don't delay the response
  sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${keyId}`.catch(() => {});

  const rl = await checkRateLimit(keyId, plan, endpoint);
  if (!rl.allowed) {
    return {
      valid: false,
      response: Response.json(
        {
          error: "RATE_LIMITED",
          message: `Rate limit exceeded: ${rl.limit} requests/minute for the ${plan} plan on /v1/${endpoint}.`,
          limit: rl.limit,
          remaining: rl.remaining,
        },
        { status: 429, headers: { "Retry-After": String(rl.resetSec) } }
      ),
    };
  }

  return { valid: true, userId, keyId, plan };
}
