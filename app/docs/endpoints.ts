export const ENDPOINTS = [
  {
    id: "markdown",
    path: "/v1/markdown",
    cost: 5,
    summary: "Strips nav, ads, and footers. Returns clean Markdown ready for LLM ingestion.",
    description:
      "Fetches the target URL via headless browser, extracts the main content block, and strips boilerplate - navigation, ads, footers, cookie banners. Returns structured Markdown with word count and metadata.",
    request: [
      { field: "url", type: "string", required: true, desc: "Full URL to scrape. Must include protocol (https://)." },
      { field: "options.includeImages", type: "boolean", required: false, desc: "Embed image alt-text in Markdown output. Default: false." },
      { field: "options.timeout", type: "number", required: false, desc: "Timeout in ms. Default: 30000. Max: 60000." },
    ],
    response: `{
  "url": "https://example.com",
  "title": "Example Domain",
  "markdown": "# Example Domain\\n\\nThis domain is for use in illustrative examples.",
  "wordCount": 17,
  "extractedAt": "2026-07-01T10:00:00Z"
}`,
  },
  {
    id: "html",
    path: "/v1/html",
    method: "GET" as const,
    cost: 5,
    summary: "Raw HTML of the page, fetched server-side. No parsing or extraction.",
    description:
      "Fetches the target URL and returns the raw HTML as-is - no Readability parsing, no boilerplate stripping. Useful when you want to run your own extraction downstream. The only GET endpoint; pass the target as a query parameter.",
    request: [
      { field: "url", type: "string", required: true, desc: "Full URL to fetch, as a query parameter. Must include protocol (https://)." },
    ],
    response: `{
  "url": "https://example.com",
  "finalUrl": "https://example.com",
  "html": "<!doctype html><html>...</html>",
  "length": 1256,
  "extractedAt": "2026-07-01T10:00:00Z"
}`,
  },
  {
    id: "json",
    path: "/v1/json",
    cost: 5,
    summary: "Structured page data - title, meta tags, OpenGraph, headings, and outbound links.",
    description:
      "Parses the page and returns a structured JSON object with all extractable metadata: title, description, OpenGraph tags, canonical URL, heading hierarchy, and up to 100 outbound links.",
    request: [
      { field: "url", type: "string", required: true, desc: "Full URL to scrape. Must include protocol (https://)." },
      { field: "options.maxLinks", type: "number", required: false, desc: "Max outbound links to return. Default: 100." },
      { field: "options.timeout", type: "number", required: false, desc: "Timeout in ms. Default: 30000. Max: 60000." },
    ],
    response: `{
  "url": "https://example.com",
  "title": "Example Domain",
  "description": "This domain is for use in illustrative examples.",
  "canonical": "https://example.com",
  "metadata": {
    "og:title": "Example Domain",
    "og:type": "website"
  },
  "headings": [{ "level": 1, "text": "Example Domain" }],
  "links": [
    { "text": "More information", "href": "https://www.iana.org/domains/example" }
  ],
  "extractedAt": "2026-07-01T10:00:00Z"
}`,
  },
  {
    id: "sitemap",
    path: "/v1/sitemap",
    cost: 5,
    summary: "Full URL list from sitemap.xml. Falls back to shallow crawl if no sitemap exists.",
    description:
      "Attempts to fetch and parse sitemap.xml (and sitemap index files). If no sitemap is found, performs a shallow crawl of the homepage to discover linked pages. Useful for bulk-scraping or building crawl queues.",
    request: [
      { field: "url", type: "string", required: true, desc: "Root URL of the site. Must include protocol (https://)." },
      { field: "options.maxPages", type: "number", required: false, desc: "Max URLs to return. Default: 500." },
      { field: "options.timeout", type: "number", required: false, desc: "Timeout in ms. Default: 30000. Max: 60000." },
    ],
    response: `{
  "url": "https://example.com",
  "source": "sitemap.xml",
  "count": 48,
  "pages": [
    { "url": "https://example.com/", "lastmod": "2026-07-01", "priority": 1.0 },
    { "url": "https://example.com/about", "lastmod": "2026-06-15", "priority": 0.8 }
  ],
  "extractedAt": "2026-07-01T10:00:00Z"
}`,
  },
  {
    id: "fonts",
    path: "/v1/fonts",
    cost: 5,
    summary: "Detected font families from CSS declarations, Google Fonts links, and style blocks.",
    description:
      "Fetches the page and its stylesheets, then extracts all font families from font-family CSS declarations and Google Fonts <link> tags. Returns an ordered list of up to 10 unique font families.",
    request: [
      { field: "url", type: "string", required: true, desc: "Full URL of the site. Must include protocol (https://)." },
      { field: "options.timeout", type: "number", required: false, desc: "Timeout in ms. Default: 30000. Max: 60000." },
    ],
    response: `{
  "url": "https://example.com",
  "fonts": ["Inter", "Geist Sans", "Geist Mono"],
  "count": 3,
  "extractedAt": "2026-07-01T10:00:00Z"
}`,
  },
  {
    id: "screenshot",
    path: "/v1/screenshot",
    cost: 10,
    summary: "Full-page or above-the-fold PNG/JPEG via headless Chromium.",
    description:
      "Renders the page in headless Chromium at 1280px viewport width and captures a screenshot. Returns a CDN-hosted image URL valid for 24 hours.",
    request: [
      { field: "url", type: "string", required: true, desc: "Full URL to screenshot. Must include protocol (https://)." },
      { field: "options.fullPage", type: "boolean", required: false, desc: "Capture the full scrollable page. Default: false (viewport only)." },
      { field: "options.format", type: "string", required: false, desc: "\"png\" or \"jpeg\". Default: \"png\"." },
      { field: "options.width", type: "number", required: false, desc: "Viewport width in px. Default: 1280. Max: 1920." },
      { field: "options.timeout", type: "number", required: false, desc: "Timeout in ms. Default: 30000. Max: 60000." },
    ],
    response: `{
  "url": "https://example.com",
  "imageUrl": "https://contextforai.ashutoshswamy.in/screenshots/abc123.png",
  "dimensions": { "width": 1280, "height": 800 },
  "format": "png",
  "fullPage": false,
  "expiresAt": "2026-07-02T10:00:00Z",
  "extractedAt": "2026-07-01T10:00:00Z"
}`,
  },
  {
    id: "branding",
    path: "/v1/branding",
    cost: 10,
    summary: "Logo URL, favicon, and primary brand color palette extracted from CSS.",
    description:
      "Extracts branding assets from the page: best-match logo image URL, favicon, and dominant color palette (up to 3 colors) ranked by frequency in CSS. Neutral colors (black, white, near-black, near-white) are filtered out.",
    request: [
      { field: "url", type: "string", required: true, desc: "Full URL of the site. Must include protocol (https://)." },
      { field: "options.timeout", type: "number", required: false, desc: "Timeout in ms. Default: 30000. Max: 60000." },
    ],
    response: `{
  "url": "https://example.com",
  "logo": "https://example.com/logo.svg",
  "colors": [
    { "name": "primary",   "hex": "#1A73E8" },
    { "name": "secondary", "hex": "#34A853" },
    { "name": "accent",    "hex": "#EA4335" }
  ]
}`,
  },
];
