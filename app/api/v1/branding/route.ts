import { NextRequest } from "next/server";
import { JSDOM } from "jsdom";
import { withExtraction } from "@/lib/extraction";
import { safeFetch } from "@/lib/fetch";
import { ERR } from "@/lib/errors";

const NEUTRAL_HEX = new Set([
  "000000", "000", "ffffff", "fff", "transparent",
]);

function normalizeHex(hex: string): string | null {
  const h = hex.toLowerCase();
  if (NEUTRAL_HEX.has(h)) return null;
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  // near-black / near-white - not useful as brand colors
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max < 20 || min > 235) return null;
  return `#${full}`;
}

function extractColors(css: string, themeColor: string | null): { name: string; hex: string }[] {
  const counts = new Map<string, number>();
  for (const m of css.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    const hex = normalizeHex(m[1]);
    if (hex) counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
  const ordered = themeColor && normalizeHex(themeColor.replace("#", ""))
    ? [normalizeHex(themeColor.replace("#", ""))!, ...ranked.filter((h) => h !== themeColor.toLowerCase())]
    : ranked;

  const names = ["primary", "secondary", "accent"];
  return ordered.slice(0, 3).map((hex, i) => ({ name: names[i], hex }));
}


export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.url || typeof body.url !== "string") return ERR.invalidUrl();

  return withExtraction(request, "branding", 10, `branding:${body.url}`, async () => {
    const { html, finalUrl } = await safeFetch(body.url);
    const dom = new JSDOM(html, { url: finalUrl });
    const { document } = dom.window;

    const icons = Array.from(document.querySelectorAll("link[rel~='icon'], link[rel='apple-touch-icon']"));
    const bestIcon = icons.sort((a, b) => {
      const size = (el: Element) => parseInt(el.getAttribute("sizes")?.split("x")[0] ?? "0", 10) || 0;
      return size(b) - size(a);
    })[0];
    const logo = bestIcon?.getAttribute("href")
      ? new URL(bestIcon.getAttribute("href")!, finalUrl).href
      : new URL("/favicon.ico", finalUrl).href;

    const themeColor = document.querySelector("meta[name='theme-color']")?.getAttribute("content") ?? null;

    const styleBlocks = Array.from(document.querySelectorAll("style")).map((el) => el.textContent ?? "").join("\n");
    const stylesheetHrefs = Array.from(document.querySelectorAll("link[rel='stylesheet']"))
      .map((el) => el.getAttribute("href"))
      .filter((href): href is string => !!href)
      .slice(0, 2);

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

    return {
      url: body.url,
      logo,
      colors: extractColors(css, themeColor),
    };
  }, undefined, body.url);
}
