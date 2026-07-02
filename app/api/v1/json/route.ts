import { NextRequest } from "next/server";
import { JSDOM } from "jsdom";
import { withExtraction } from "@/lib/extraction";
import { safeFetch } from "@/lib/fetch";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.url || typeof body.url !== "string") {
    return Response.json({ error: "INVALID_URL", message: "Malformed or disallowed URL." }, { status: 400 });
  }

  return withExtraction(request, "json", 5, `json:${body.url}`, async () => {
    const { html, finalUrl } = await safeFetch(body.url);
    const dom = new JSDOM(html, { url: finalUrl });
    const { document } = dom.window;

    const og: Record<string, string> = {};
    document.querySelectorAll("meta[property^='og:']").forEach((el) => {
      og[el.getAttribute("property")!.replace("og:", "")] =
        el.getAttribute("content") ?? "";
    });

    const twitter: Record<string, string> = {};
    document.querySelectorAll("meta[name^='twitter:']").forEach((el) => {
      twitter[el.getAttribute("name")!.replace("twitter:", "")] =
        el.getAttribute("content") ?? "";
    });

    const jsonLd: unknown[] = [];
    document.querySelectorAll("script[type='application/ld+json']").forEach((el) => {
      try {
        jsonLd.push(JSON.parse(el.textContent ?? ""));
      } catch { /* skip */ }
    });

    return {
      url: body.url,
      title: document.title || null,
      description:
        document.querySelector("meta[name='description']")?.getAttribute("content") ?? null,
      canonical:
        document.querySelector("link[rel='canonical']")?.getAttribute("href") ?? null,
      metadata: { og, twitter, jsonLd },
      headings: Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((el) => ({
        level: parseInt(el.tagName[1]),
        text: el.textContent?.trim() ?? "",
      })),
      links: Array.from(document.querySelectorAll("a[href]"))
        .slice(0, 200)
        .map((el) => ({ text: el.textContent?.trim() ?? "", href: el.getAttribute("href") ?? "" })),
      images: Array.from(document.querySelectorAll("img"))
        .slice(0, 100)
        .map((el) => ({ src: el.getAttribute("src") ?? "", alt: el.getAttribute("alt") ?? "" })),
    };
  }, undefined, body.url);
}
