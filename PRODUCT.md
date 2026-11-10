# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

AI/LLM developers building agents, RAG pipelines, and AI apps. They need clean, structured page data from arbitrary URLs and want one API key, predictable credits, and answers in minutes. Secondary: indie hackers and small teams automating SEO, brand, or screenshot work.

## Product Purpose

contextforai is a web extraction API. One key, seven endpoints: Markdown, raw HTML, structured JSON, sitemap, fonts, screenshot, brand assets. Credit-based billing, per-plan rate limits, SSRF protection and Redis-backed rate limiting. Success: a developer goes from landing page to first successful call without friction, then upgrades when credits run out.

## Positioning

Single API key and one credit pool covering both LLM-ready content (Markdown via Readability) and design/brand intelligence (fonts, brand colors, logo, screenshots) from any URL.

## Operating Context

Visitors read the landing page, try the playground, read docs, sign up via Clerk, create API keys in a dashboard (keys, usage, analytics, billing, playground), and pay via Razorpay (INR).

## Capabilities and Constraints

- Endpoints and credit cost: /v1/markdown, /v1/html, /v1/json, /v1/sitemap, /v1/fonts (5 credits each); /v1/screenshot, /v1/branding (10 credits each); /v1/usage.
- Plans (INR): Free 500 credits/mo, 20 req/min; Starter Rs 499/mo 10,000 credits; Growth Rs 999/mo 50,000 credits; Pro Rs 1,999/mo 100,000 credits. Yearly prices exist (Rs 4,790 / 9,590 / 19,190).
- Stack: Next.js 16 App Router, Tailwind v4, shadcn/ui (radix-nova), Clerk auth. Site URL https://contextforai.ashutoshswamy.in.
- Routes to preserve: /, /docs, /playground, /sign-in, /sign-up, /privacy, /terms, /dashboard/{keys,usage,analytics,billing,playground}.

## Brand Commitments

Name "contextforai". Copy and product facts stay. Visual identity is a free hand: the old look (black, #FF4F00 orange, sharp corners, stacked-panel scroll) is anti-reference.

## Evidence on Hand

No customer logos, testimonials, or benchmarks exist. Do not fabricate any. Assets: public/logo.png, public/og-image.png.

## Product Principles

1. Time to first successful call is the product.
2. Show real requests and real responses, never fake ones.
3. Prices and credit costs are always legible; no surprise.
4. One system across marketing, docs, auth, and dashboard.

## Accessibility & Inclusion

WCAG AA contrast, visible keyboard focus, prefers-reduced-motion honored.
