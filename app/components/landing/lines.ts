export type Line = {
  id: string;
  path: string;
  method: "POST" | "GET";
  name: string;
  cost: number;
  description: string;
  sample: string;
};

const U = "https://example.com";

export const LINES: Line[] = [
  {
    id: "markdown",
    path: "/v1/markdown",
    method: "POST",
    name: "Markdown",
    cost: 5,
    description: "Strips nav, ads, and footers. Returns clean Markdown ready for LLM ingestion.",
    sample: `{
  "url": "${U}",
  "title": "Example Domain",
  "markdown": "# Example Domain\\n\\nThis domain is for use in illustrative examples...",
  "wordCount": 17
}`,
  },
  {
    id: "html",
    path: "/v1/html",
    method: "GET",
    name: "HTML",
    cost: 5,
    description: "Raw HTML of the page, fetched server-side. No parsing or extraction.",
    sample: `GET /v1/html?url=${U}

<!doctype html>
<html>
  <head><title>Example Domain</title></head>
  <body>...</body>
</html>`,
  },
  {
    id: "json",
    path: "/v1/json",
    method: "POST",
    name: "JSON",
    cost: 5,
    description: "Structured page data: title, meta tags, OpenGraph, headings, and outbound links.",
    sample: `{
  "url": "${U}",
  "title": "Example Domain",
  "metadata": { "og:type": "website" },
  "headings": [{ "level": 1, "text": "Example Domain" }],
  "links": [{ "text": "More information...", "href": "https://iana.org/domains/example" }]
}`,
  },
  {
    id: "sitemap",
    path: "/v1/sitemap",
    method: "POST",
    name: "Sitemap",
    cost: 5,
    description: "Full URL list from sitemap.xml. Falls back to a shallow crawl if none exists.",
    sample: `{
  "url": "${U}",
  "source": "${U}/sitemap.xml",
  "pages": [
    { "url": "${U}/" },
    { "url": "${U}/about" }
  ],
  "count": 2
}`,
  },
  {
    id: "fonts",
    path: "/v1/fonts",
    method: "POST",
    name: "Fonts",
    cost: 5,
    description: "Font families found in CSS declarations, Google Fonts links, and style blocks.",
    sample: `{
  "url": "${U}",
  "fonts": ["Inter", "Roboto Mono"],
  "count": 2
}`,
  },
  {
    id: "screenshot",
    path: "/v1/screenshot",
    method: "POST",
    name: "Screenshot",
    cost: 10,
    description: "Full-page or above-the-fold PNG or JPEG through headless Chromium.",
    sample: `{
  "url": "${U}",
  "screenshotUrl": "https://.../screenshot.png",
  "dimensions": { "width": 1280, "height": 800 },
  "format": "png"
}`,
  },
  {
    id: "branding",
    path: "/v1/branding",
    method: "POST",
    name: "Branding",
    cost: 10,
    description: "Logo URL, favicon, and the primary brand color palette pulled from CSS.",
    sample: `{
  "url": "${U}",
  "logo": "https://example.com/logo.svg",
  "colors": [
    { "name": "primary", "hex": "#1a73e8" },
    { "name": "secondary", "hex": "#202124" }
  ]
}`,
  },
];

export const lineColor = (id: string) => `var(--l-${id})`;
