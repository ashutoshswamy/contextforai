import sql from "./db.ts";

export function logUsage(
  keyId: number,
  userId: number,
  endpoint: string,
  statusCode: number,
  creditsUsed: number,
  latencyMs?: number,
  targetUrl?: string,
  source?: string
): void {
  sql`
    INSERT INTO usage_logs
      (api_key_id, user_id, endpoint, status_code, credits_used, latency_ms, target_url, source)
    VALUES
      (${keyId}, ${userId}, ${endpoint}, ${statusCode}, ${creditsUsed},
       ${latencyMs ?? null}, ${targetUrl ?? null}, ${source ?? "api"})
  `.catch(() => {});
}
