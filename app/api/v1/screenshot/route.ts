import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { chromium as playwright } from "playwright-core";
import chromium from "@sparticuz/chromium";
import { put } from "@vercel/blob";
import { withExtraction } from "@/lib/extraction";
import { validateUrl, assertResolvesPublic } from "@/lib/ssrf";
import { ERR } from "@/lib/errors";

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_VERSION;

async function launchBrowser() {
  if (isServerless) {
    return playwright.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  return playwright.launch({ headless: true });
}

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  return Number.isInteger(n) ? Math.min(Math.max(n as number, min), max) : fallback;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.url || typeof body.url !== "string") return ERR.invalidUrl();

  try {
    validateUrl(body.url);
  } catch {
    return ERR.invalidUrl();
  }

  const fullPage = body.fullPage === true;
  const width = clamp(body.width, 320, 1920, 1280);
  const height = clamp(body.height, 240, 1080, 800);

  return withExtraction(
    request,
    "screenshot",
    10,
    `screenshot:${body.url}:${width}x${height}:${fullPage}`,
    async () => {
      const browser = await launchBrowser();
      try {
        const page = await browser.newPage({ viewport: { width, height } });

        // Playwright follows redirects (and loads subresources) inside the
        // browser itself, completely bypassing safeFetch's SSRF checks. This
        // intercepts every request the page makes — main navigation, any
        // redirect hop, every subresource — and blocks anything resolving to
        // a private/internal address before it leaves the process.
        await page.route("**/*", async (route) => {
          try {
            const parsed = validateUrl(route.request().url());
            await assertResolvesPublic(parsed.hostname);
            await route.continue();
          } catch {
            await route.abort();
          }
        });

        await page.goto(body.url, { waitUntil: "networkidle", timeout: 15_000 });
        const buffer = await page.screenshot({ fullPage, type: "png" });
        const blob = await put(`screenshots/${randomUUID()}.png`, buffer, {
          access: "public",
          contentType: "image/png",
        });
        return {
          url: body.url,
          imageUrl: blob.url,
          dimensions: { width, height },
          format: "png",
          extractedAt: new Date().toISOString(),
        };
      } finally {
        await browser.close();
      }
    },
    undefined,
    body.url
  );
}
