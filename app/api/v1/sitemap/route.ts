import { NextRequest } from "next/server";
import { JSDOM } from "jsdom";
import { validateApiKey } from "@/lib/auth";
import { reserveCredits, refundCredits } from "@/lib/credits";
import { logUsage } from "@/lib/usage";
import { cacheGet, cacheSet } from "@/lib/cache";
import { safeFetch } from "@/lib/fetch";
import { validateUrl } from "@/lib/ssrf";
import { ERR, handleFetchError } from "@/lib/errors";

type Page = { url: string; lastmod?: string; title?: string };

// ponytail: 5 credits flat; v2 can charge 5 for crawl fallback
const COST = 5;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.url || typeof body.url !== "string") return ERR.invalidUrl();

  const source = request.headers.get("x-source") ?? "api";
  const auth = await validateApiKey(request, "sitemap");
  if (!auth.valid) return auth.response;

  let origin: string;
  try {
    origin = validateUrl(body.url).origin;
  } catch {
    return ERR.invalidUrl();
  }

  const cacheKey = `sitemap:${origin}`;
  const t0 = Date.now();
  const cached = await cacheGet<object>(cacheKey);
  if (cached) {
    logUsage(auth.keyId, auth.userId, "sitemap", 200, 0, Date.now() - t0, body.url, source);
    return Response.json(cached);
  }

  const credit = await reserveCredits(auth.userId, COST);
  if (!credit.ok) return credit.response;

  try {
    // robots.txt → declared sitemap
    let sitemapUrl: string | null = null;
    try {
      const { html: robots } = await safeFetch(`${origin}/robots.txt`);
      const m = robots.match(/^Sitemap:\s*(.+)$/im);
      if (m) sitemapUrl = m[1].trim();
    } catch { /* fine */ }

    for (const candidate of [sitemapUrl, `${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`].filter(Boolean) as string[]) {
      try {
        const { html: xml } = await safeFetch(candidate);
        const pages = parseSitemapXml(xml);
        if (pages.length > 0) {
          const result = { domain: new URL(origin).hostname, source: "sitemap.xml", pages };
          await cacheSet(cacheKey, result);
          logUsage(auth.keyId, auth.userId, "sitemap", 200, COST, Date.now() - t0, body.url, source);
          return Response.json(result);
        }
      } catch { /* try next */ }
    }

    // Crawl fallback
    const { html, finalUrl } = await safeFetch(body.url);
    const pages = shallowCrawl(html, finalUrl, origin);
    const result = { domain: new URL(origin).hostname, source: "crawl", pages };
    await cacheSet(cacheKey, result, 1_800_000);
    logUsage(auth.keyId, auth.userId, "sitemap", 200, COST, Date.now() - t0, body.url, source);
    return Response.json(result);
  } catch (err) {
    await refundCredits(auth.userId, COST);
    return handleFetchError(err);
  }
}

function parseSitemapXml(xml: string): Page[] {
  const dom = new JSDOM(xml, { contentType: "text/xml" });
  const doc = dom.window.document;

  const urlEls = Array.from(doc.querySelectorAll("url"));
  if (urlEls.length > 0) {
    return urlEls.slice(0, 500).flatMap((el) => {
      const url = el.querySelector("loc")?.textContent?.trim();
      if (!url) return [];
      return [{ url, lastmod: el.querySelector("lastmod")?.textContent?.trim() }];
    });
  }

  return Array.from(doc.querySelectorAll("sitemap"))
    .slice(0, 50)
    .flatMap((el) => {
      const url = el.querySelector("loc")?.textContent?.trim();
      if (!url) return [];
      return [{ url, lastmod: el.querySelector("lastmod")?.textContent?.trim() }];
    });
}

function shallowCrawl(html: string, baseUrl: string, origin: string): Page[] {
  const dom = new JSDOM(html, { url: baseUrl });
  const { document } = dom.window;
  const seen = new Set<string>([baseUrl]);
  const pages: Page[] = [{ url: baseUrl, title: document.title || undefined }];

  for (const a of Array.from(document.querySelectorAll("a[href]"))) {
    if (pages.length >= 100) break;
    try {
      const url = new URL(a.getAttribute("href")!, baseUrl);
      if (url.origin !== origin || seen.has(url.href)) continue;
      seen.add(url.href);
      pages.push({ url: url.href, title: a.textContent?.trim() || undefined });
    } catch { /* invalid href */ }
  }

  return pages;
}
