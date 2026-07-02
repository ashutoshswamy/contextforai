# contextforai

One API to extract structured data from any URL — clean Markdown, raw HTML,
structured JSON, sitemaps, screenshots, and brand assets. Single API key,
credit-based billing, per-plan rate limits.

Live docs: [contextforai.ashutoshswamy.in/docs](https://contextforai.ashutoshswamy.in/docs)

## Endpoints

| Endpoint | Method | Cost | Description |
|---|---|---|---|
| `/v1/markdown` | POST | 5 cr | Clean Markdown via Readability, boilerplate stripped |
| `/v1/html` | GET | 5 cr | Raw HTML, no parsing (the only GET endpoint — `?url=`) |
| `/v1/json` | POST | 5 cr | Title, meta tags, OpenGraph, headings, links |
| `/v1/sitemap` | POST | 5 cr | Page list from sitemap.xml, falls back to shallow crawl |
| `/v1/fonts` | POST | 5 cr | Font families from CSS and Google Fonts links |
| `/v1/screenshot` | POST | 10 cr | Full-page or viewport PNG via headless Chromium |
| `/v1/branding` | POST | 10 cr | Logo, favicon, dominant brand colors |

Full request/response schemas, error codes, and rate limits: `/docs`.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: Clerk
- **DB**: Postgres (Neon serverless driver)
- **Cache / rate limiting**: Upstash Redis
- **Payments**: Razorpay
- **File storage**: Vercel Blob (screenshots)
- **Extraction**: `@mozilla/readability`, `jsdom`, `turndown`, Playwright + `@sparticuz/chromium`
- **UI**: Tailwind v4, shadcn/ui, GSAP

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

See [`.env.example`](./.env.example) for the full list — you'll need accounts
with Neon (Postgres), Clerk (auth), Upstash (Redis), Razorpay (payments), and
Vercel Blob (screenshot storage).

### Database setup

Run [`db/schema.sql`](./db/schema.sql) once against your Postgres database
(Neon console, `psql`, etc). `db/reset.sql` drops and recreates everything
from scratch — **destructive**, dev/staging only.

### Scripts

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # start production server
npm run lint     # eslint
npm test         # run the test suite (see below)
```

## Testing

```bash
npm test
```

Uses Node's built-in test runner (`node --test`) against `.ts` files
directly — no test framework dependency. Two kinds of tests:

- **Pure logic** (`tests/ssrf.test.ts`, `tests/ratelimit.test.ts`) — no
  external dependencies, always run.
- **DB integration** (`tests/credits.test.ts`) — exercises the credit/topup
  system against a real Postgres connection. Skips automatically if
  `DATABASE_URL` isn't set (e.g. CI without secrets), rather than failing.

Tests use throwaway rows (created and deleted per test) — safe to run against
a real database, including production, though a dev/staging DB is preferred.

## Project structure

```
app/
  api/v1/*          extraction endpoints (see table above)
  api/user/*        session-authenticated dashboard endpoints (keys, billing)
  api/webhooks/*     Clerk + Razorpay webhook handlers
  dashboard/         authenticated app (overview, keys, billing, analytics, usage)
  docs/              public API reference (rendered from live endpoint/rate-limit data)
  components/        marketing + dashboard UI
lib/
  ssrf.ts            SSRF protection (private-IP/DNS-rebinding checks)
  fetch.ts           SSRF-safe fetch with manual redirect revalidation
  auth.ts            API key validation + rate limiting
  credits.ts         credit reservation/refund, monthly + topup pools
  ratelimit.ts       Redis fixed-window rate limiter
  extraction.ts      shared auth → cache → credit → extract → log pipeline
db/
  schema.sql         table definitions (idempotent, safe to re-run)
  reset.sql          destructive drop + recreate
tests/               node:test suite
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for how the credit
system, rate limiting, and SSRF protections actually work.

## Security

Found a vulnerability? See [`SECURITY.md`](./SECURITY.md) — please don't open
a public issue.

## License

Private project, all rights reserved.
