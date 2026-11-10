import type { Metadata } from "next";

export const SITE_URL = "https://contextforai.ashutoshswamy.in";
export const SITE_NAME = "contextforai";
export const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "contextforai web extraction API" };

/** Per-page metadata with its own canonical + OG/Twitter (children don't inherit the home page's). */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_US", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}
