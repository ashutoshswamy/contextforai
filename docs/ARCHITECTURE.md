# Architecture

Internal notes on how the non-obvious parts of this codebase work. For the
public API reference (endpoints, request/response shapes), see `/docs` on
the live site — this file is about the implementation, not the API surface.

## Request pipeline

Every `/v1/*` extraction endpoint (except `screenshot`, see below) funnels
through `lib/extraction.ts`'s `withExtraction()`:

```
validateApiKey (auth + rate limit)
  → cache check (hit → return, 0 credits charged)
  → reserveCredits (draws monthly pool first, then topup pool)
  → run the actual extraction handler
  → on failure: refundCredits
  → on success: cacheSet + logUsage
```

Cache is checked *before* credits are reserved — a cache hit must never cost
credits. This was a real bug (credits were reserved unconditionally before
the cache check), fixed and covered by `tests/credits.test.ts`.

The `sitemap` endpoint has its own copy of this flow instead of using
`withExtraction()` (it needs multi-stage fetching: robots.txt → sitemap.xml →
crawl fallback, with only one credit charge across all of it). If you change
the credit/cache logic in `withExtraction()`, check `sitemap/route.ts` too.

## Credit system

`user_plans` has two credit pools, kept deliberately separate:

- `credits_balance` / `credits_monthly` — the plan's recurring allowance.
  Resets to `credits_monthly` every 30 days from `cycle_reset_at`. Does not
  roll over. Applies to every plan including free (500/month by default).
- `topup_balance` / `topup_expires_at` — one-time purchased credits. Expire
  30 days after purchase, independent of the monthly cycle.

`reserveCredits()` (`lib/credits.ts`) draws from the monthly pool first, then
spills into topup once monthly is exhausted, in one atomic SQL statement
(`FOR UPDATE` + a CTE) to avoid a race under concurrent requests. Refunds
always land in `topup_balance` with a fresh 30-day expiry — refunding into
the monthly pool would risk the refund being silently wiped by the next
cycle reset before it's ever used.

Both plan purchases and topup purchases run through *two* code paths that
must stay in sync: `app/api/user/billing/verify/route.ts` (client-initiated
verification) and `app/api/webhooks/razorpay/route.ts` (server-side webhook,
fires independently, idempotent via `orders.status`). If you change credit
fulfillment logic, change both.

## Rate limiting

`lib/ratelimit.ts` — fixed 60-second window in Redis, `INCR` + `EXPIRE`.
Fails open on Redis errors (a Redis outage shouldn't take down the API).
This means a burst of ~2x the limit is possible right at a window boundary —
acceptable tradeoff for the added complexity of a sliding window; revisit if
that's ever actually abused.

Two kinds of limiter, same underlying `fixedWindowCheck()`:
- `checkRateLimit(keyId, plan, endpoint)` — per API key + endpoint, tiered by
  plan (`free`/`starter`/`growth`/`pro`), halved for the two heavy endpoints
  (`screenshot`, `branding`, which run a headless browser / fan out CSS
  fetches).
- `checkUserActionLimit(clerkId, action, limit)` — per Clerk session user,
  for the dashboard's own API routes (key management, billing), which aren't
  tied to a plan tier.

## SSRF protection

`lib/ssrf.ts` + `lib/fetch.ts`. Three layers, because each closes a
different bypass:

1. **Hostname string check** (`validateUrl`) — blocks private IPv4/IPv6
   ranges, loopback, link-local, cloud metadata hostnames, and IPv4-mapped
   IPv6. Also caps URL length (2048 chars).
2. **Redirect revalidation** (`safeFetch`, manual redirect following) — a
   URL that passes validation but 302s to an internal address would
   otherwise bypass the check entirely if `fetch()` were left to auto-follow
   redirects. Every hop is re-validated.
3. **DNS resolution check** (`assertResolvesPublic`) — catches DNS
   rebinding, where a public-looking hostname resolves to a private IP.
   There's a small TOCTOU window between this check and the connection
   `fetch()` actually makes — closing that fully needs a custom
   connect-time DNS resolver (an undici `Agent` with a `lookup` hook),
   deliberately not done here; the runtime-portability risk wasn't worth it
   for the residual gap.

The `screenshot` endpoint doesn't use `safeFetch` — it hands the URL to a
real headless Chromium instance (Playwright), which follows redirects and
loads subresources *inside the browser*, bypassing all of the above. It gets
its own protection: `page.route('**/*', ...)` intercepts every request the
page makes and runs the same hostname + DNS checks before allowing it
through.

**Non-obvious gotcha**: `new URL(...).hostname` returns IPv6 literals *with
brackets* (`"[::1]"`, not `"::1"`). Every IPv6 regex in `isPrivateHost()` is
written against the bare address — they silently never matched anything
until this was caught by `tests/ssrf.test.ts`. If you touch the IPv6
handling, keep the bracket-stripping.

## Testing

`npm test` runs Node's built-in test runner directly against `.ts` files
(`allowImportingTsExtensions` in `tsconfig.json` + explicit `.ts` extensions
on internal `lib/*` relative imports — required for Node's native ESM
resolution, harmless for Next's bundler resolution). No test framework
dependency.

- `tests/ssrf.test.ts`, `tests/ratelimit.test.ts` — pure logic, no external
  dependencies.
- `tests/credits.test.ts` — real DB integration (throwaway rows, cleaned up
  per test). Skips if `DATABASE_URL` isn't set rather than failing.
