import type { NextRequest } from "next/server";
import { validateApiKey } from "./auth.ts";
import { reserveCredits, refundCredits } from "./credits.ts";
import { logUsage } from "./usage.ts";
import { cacheGet, cacheSet } from "./cache.ts";
import { handleFetchError } from "./errors.ts";

export async function withExtraction<T extends object>(
  request: NextRequest,
  endpoint: string,
  cost: number,
  cacheKey: string,
  handler: () => Promise<T | Response>,
  cacheTtl?: number,
  targetUrl?: string
): Promise<Response> {
  const source = request.headers.get("x-source") ?? "api";
  const auth = await validateApiKey(request, endpoint);
  if (!auth.valid) return auth.response;

  const t0 = Date.now();
  const cached = await cacheGet<T>(cacheKey);
  if (cached) {
    logUsage(auth.keyId, auth.userId, endpoint, 200, 0, Date.now() - t0, targetUrl, source);
    return Response.json(cached);
  }

  const credit = await reserveCredits(auth.userId, cost);
  if (!credit.ok) return credit.response;

  let result: T | Response;
  try {
    result = await handler();
  } catch (err) {
    await refundCredits(auth.userId, cost);
    return handleFetchError(err);
  }
  const latency = Date.now() - t0;

  if (result instanceof Response) {
    await refundCredits(auth.userId, cost);
    logUsage(auth.keyId, auth.userId, endpoint, result.status, 0, latency, targetUrl, source);
    return result;
  }

  await cacheSet(cacheKey, result, cacheTtl);
  logUsage(auth.keyId, auth.userId, endpoint, 200, cost, latency, targetUrl, source);
  return Response.json(result);
}
