import { NextRequest } from "next/server";
import { JSDOM } from "jsdom";
import { withExtraction } from "@/lib/extraction";
import { safeFetch } from "@/lib/fetch";
import { ERR } from "@/lib/errors";

function extractFonts(document: Document, css: string): string[] {
  const fonts = new Set<string>();

  document.querySelectorAll("link[href*='fonts.googleapis.com']").forEach((el) => {
    const href = el.getAttribute("href") ?? "";
    const match = href.match(/family=([^&:]+)/g);
    match?.forEach((m) => {
      const family = decodeURIComponent(m.replace("family=", "")).replace(/\+/g, " ");
      fonts.add(family);
    });
  });

  for (const m of css.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    const first = m[1].split(",")[0].trim().replace(/^['"]|['"]$/g, "");
    if (first && !/^(inherit|initial|unset)$/i.test(first)) fonts.add(first);
  }

  return [...fonts].slice(0, 10);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.url || typeof body.url !== "string") return ERR.invalidUrl();

  return withExtraction(request, "fonts", 5, `fonts:${body.url}`, async () => {
    const { html, finalUrl } = await safeFetch(body.url);
    const dom = new JSDOM(html, { url: finalUrl });
    const { document } = dom.window;

    const styleBlocks = Array.from(document.querySelectorAll("style"))
      .map((el) => el.textContent ?? "")
      .join("\n");

    const stylesheetHrefs = Array.from(document.querySelectorAll("link[rel='stylesheet']"))
      .map((el) => el.getAttribute("href"))
      .filter((href): href is string => !!href)
      .slice(0, 3);

    const externalCss = (
      await Promise.all(
        stylesheetHrefs.map(async (href) => {
          try {
            const { html: css } = await safeFetch(new URL(href, finalUrl).href);
            return css;
          } catch {
            return "";
          }
        })
      )
    ).join("\n");

    const css = styleBlocks + "\n" + externalCss;
    const fonts = extractFonts(document, css);

    return {
      url: body.url,
      fonts,
      count: fonts.length,
      extractedAt: new Date().toISOString(),
    };
  }, undefined, body.url);
}
