import { NextRequest } from "next/server";
import { withExtraction } from "@/lib/extraction";
import { safeFetch } from "@/lib/fetch";
import { ERR } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return ERR.invalidUrl();

  return withExtraction(request, "html", 5, `html:${url}`, async () => {
    const { html, finalUrl } = await safeFetch(url);
    return {
      url,
      finalUrl,
      html,
      length: html.length,
      extractedAt: new Date().toISOString(),
    };
  }, undefined, url);
}
