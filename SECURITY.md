# Security Policy

## Reporting a vulnerability

**Please don't open a public GitHub issue for security vulnerabilities.**

Email **ashutoshswamy397@gmail.com** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce (a minimal example is ideal)
- Any relevant request/response payloads, with sensitive data redacted

You'll get an acknowledgment within a few days. If it's confirmed, we'll
work on a fix and let you know once it's deployed before any public
disclosure. There's no bug bounty program — this is a small project — but
genuine reports are credited if you'd like.

## Scope

In scope:
- The API (`/v1/*` endpoints) — auth bypass, credit/billing manipulation,
  SSRF, injection, rate-limit bypass
- The dashboard and billing flow
- Webhook handlers (`/api/webhooks/*`)

Out of scope:
- Vulnerabilities in third-party services this project depends on (Clerk,
  Razorpay, Neon, Upstash, Vercel) — report those upstream
- Denial of service via sheer request volume (rate limiting exists, but
  volumetric DoS is an infra/platform concern, not app-level)
- Social engineering, physical access

## Supported versions

This is a single continuously-deployed application, not a versioned
library — only the current production deployment is supported. There's no
older version receiving security patches.

## What this project already does

Documented here so reports don't duplicate known, deliberate mitigations —
if you find a bypass in one of these, that's still worth reporting:

- **SSRF**: private-IP/hostname blocking, redirect-hop revalidation, DNS
  resolution checks, and headless-browser request interception for the
  screenshot endpoint. See `docs/ARCHITECTURE.md` for the known residual
  gap (DNS-rebinding TOCTOU).
- **Auth**: API keys are SHA-256 hashed at rest, never stored or logged in
  plaintext after creation. Webhook signatures (Razorpay, Clerk) are
  verified with constant-time comparison.
- **Rate limiting**: per-API-key and per-dashboard-user, tiered by plan.
- **Input validation**: URL length caps, type guards on all request bodies,
  webhook payload shape checks.
- **Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
  Permissions-Policy set on every response.
