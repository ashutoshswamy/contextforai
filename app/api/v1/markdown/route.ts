import { NextRequest } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { withExtraction } from "@/lib/extraction";
import { safeFetch } from "@/lib/fetch";
import { ERR } from "@/lib/errors";

const td = new TurndownService();

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.url || typeof body.url !== "string") return ERR.invalidUrl();

  return withExtraction(request, "markdown", 5, `markdown:${body.url}`, async () => {
    const { html, finalUrl } = await safeFetch(body.url);
    const dom = new JSDOM(html, { url: finalUrl });
    const article = new Readability(dom.window.document).parse();
    if (!article?.content) return ERR.extractionFailed();

    const markdown = td.turndown(article.content);
    return {
      url: body.url,
      title: article.title ?? null,
      excerpt: article.excerpt ?? null,
      markdown,
      wordCount: markdown.split(/\s+/).filter(Boolean).length,
      extractedAt: new Date().toISOString(),
    };
  }, undefined, body.url);
}
