"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const NAV = [
  { label: "Authentication", href: "#authentication" },
  { label: "/v1/markdown", href: "#markdown" },
  { label: "/v1/html", href: "#html" },
  { label: "/v1/json", href: "#json" },
  { label: "/v1/sitemap", href: "#sitemap" },
  { label: "/v1/fonts", href: "#fonts" },
  { label: "/v1/screenshot", href: "#screenshot" },
  { label: "/v1/branding", href: "#branding" },
  { label: "Error codes", href: "#errors" },
  { label: "Rate limits", href: "#rate-limits" },
  { label: "Credits & billing", href: "#credits" },
];

const LANGS = ["curl", "node", "python", "go", "rust"] as const;
type Lang = (typeof LANGS)[number];

const LANG_LABELS: Record<Lang, string> = {
  curl: "curl",
  node: "Node.js",
  python: "Python",
  go: "Go",
  rust: "Rust",
};

function snippet(path: string, lang: Lang, method: "GET" | "POST" = "POST"): string {
  if (method === "GET") {
    const url = `https://contextforai.ashutoshswamy.in${path}?url=https://example.com`;
    switch (lang) {
      case "curl":
        return `curl "${url}" \\\n  -H "Authorization: Bearer cfai_your_key_here"`;
      case "node":
        return (
          `const res = await fetch("${url}", {\n` +
          `  headers: { "Authorization": "Bearer cfai_your_key_here" },\n` +
          `});\n` +
          `const data = await res.json();`
        );
      case "python":
        return (
          `import httpx\n\n` +
          `response = httpx.get(\n` +
          `    "${url}",\n` +
          `    headers={"Authorization": "Bearer cfai_your_key_here"},\n` +
          `)\n` +
          `data = response.json()`
        );
      case "go":
        return (
          `package main\n\n` +
          `import (\n` +
          `    "io"\n` +
          `    "net/http"\n` +
          `)\n\n` +
          `func main() {\n` +
          `    req, _ := http.NewRequest("GET", "${url}", nil)\n` +
          `    req.Header.Set("Authorization", "Bearer cfai_your_key_here")\n` +
          `    resp, _ := http.DefaultClient.Do(req)\n` +
          `    defer resp.Body.Close()\n` +
          `    data, _ := io.ReadAll(resp.Body)\n` +
          `    _ = data\n` +
          `}`
        );
      case "rust":
        return (
          `use reqwest::Client;\n\n` +
          `#[tokio::main]\n` +
          `async fn main() -> Result<(), Box<dyn std::error::Error>> {\n` +
          `    let client = Client::new();\n` +
          `    let data = client\n` +
          `        .get("${url}")\n` +
          `        .bearer_auth("cfai_your_key_here")\n` +
          `        .send()\n` +
          `        .await?\n` +
          `        .json::<serde_json::Value>()\n` +
          `        .await?;\n` +
          `    println!("{:#?}", data);\n` +
          `    Ok(())\n` +
          `}`
        );
    }
  }

  const url = `https://contextforai.ashutoshswamy.in${path}`;
  switch (lang) {
    case "curl":
      return (
        `curl -X POST ${url} \\\n` +
        `  -H "Authorization: Bearer cfai_your_key_here" \\\n` +
        `  -H "Content-Type: application/json" \\\n` +
        `  -d '{"url": "https://example.com"}'`
      );
    case "node":
      return (
        `const res = await fetch("${url}", {\n` +
        `  method: "POST",\n` +
        `  headers: {\n` +
        `    "Authorization": "Bearer cfai_your_key_here",\n` +
        `    "Content-Type": "application/json",\n` +
        `  },\n` +
        `  body: JSON.stringify({ url: "https://example.com" }),\n` +
        `});\n` +
        `const data = await res.json();`
      );
    case "python":
      return (
        `import httpx\n\n` +
        `response = httpx.post(\n` +
        `    "${url}",\n` +
        `    headers={\n` +
        `        "Authorization": "Bearer cfai_your_key_here",\n` +
        `        "Content-Type": "application/json",\n` +
        `    },\n` +
        `    json={"url": "https://example.com"},\n` +
        `)\n` +
        `data = response.json()`
      );
    case "go":
      return (
        `package main\n\n` +
        `import (\n` +
        `    "bytes"\n` +
        `    "encoding/json"\n` +
        `    "io"\n` +
        `    "net/http"\n` +
        `)\n\n` +
        `func main() {\n` +
        `    body, _ := json.Marshal(map[string]string{"url": "https://example.com"})\n` +
        `    req, _ := http.NewRequest("POST", "${url}", bytes.NewBuffer(body))\n` +
        `    req.Header.Set("Authorization", "Bearer cfai_your_key_here")\n` +
        `    req.Header.Set("Content-Type", "application/json")\n` +
        `    resp, _ := http.DefaultClient.Do(req)\n` +
        `    defer resp.Body.Close()\n` +
        `    data, _ := io.ReadAll(resp.Body)\n` +
        `    _ = data\n` +
        `}`
      );
    case "rust":
      return (
        `use reqwest::Client;\n` +
        `use serde_json::json;\n\n` +
        `#[tokio::main]\n` +
        `async fn main() -> Result<(), Box<dyn std::error::Error>> {\n` +
        `    let client = Client::new();\n` +
        `    let data = client\n` +
        `        .post("${url}")\n` +
        `        .bearer_auth("cfai_your_key_here")\n` +
        `        .json(&json!({ "url": "https://example.com" }))\n` +
        `        .send()\n` +
        `        .await?\n` +
        `        .json::<serde_json::Value>()\n` +
        `        .await?;\n` +
        `    println!("{:#?}", data);\n` +
        `    Ok(())\n` +
        `}`
      );
  }
}

const ENDPOINTS = [
  {
    id: "markdown",
    path: "/v1/markdown",
    cost: 5,
    summary: "Strips nav, ads, and footers. Returns clean Markdown ready for LLM ingestion.",
    description:
      "Fetches the target URL via headless browser, extracts the main content block, and strips boilerplate — navigation, ads, footers, cookie banners. Returns structured Markdown with word count and metadata.",
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
      "Fetches the target URL and returns the raw HTML as-is — no Readability parsing, no boilerplate stripping. Useful when you want to run your own extraction downstream. The only GET endpoint; pass the target as a query parameter.",
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
    summary: "Structured page data — title, meta tags, OpenGraph, headings, and outbound links.",
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

const ERRORS = [
  { code: 400, name: "bad_request", desc: "Missing or invalid request body. Check that url is present and valid." },
  { code: 401, name: "unauthorized", desc: "Missing or invalid API key. Ensure the Authorization header is set correctly." },
  { code: 402, name: "insufficient_credits", desc: "Account has no remaining credits. Top up in the dashboard." },
  { code: 422, name: "unprocessable_url", desc: "The URL returned a non-200 status, timed out, or could not be rendered." },
  { code: 429, name: "rate_limited", desc: "Too many requests. See Rate limits for per-plan, per-endpoint limits." },
  { code: 500, name: "internal_error", desc: "Something went wrong on our end. Retrying after 5 seconds usually resolves it." },
];

// keep in sync with PLAN_LIMITS in lib/ratelimit.ts
const RATE_LIMITS: Record<string, number> = { free: 20, starter: 60, growth: 120, pro: 180 };

function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-mono text-xs px-1.5 py-0.5"
      style={{ backgroundColor: "#1A1A1A", color: "#A0A0A0" }}
    >
      {children}
    </code>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div style={{ backgroundColor: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)" }}>
      {label && (
        <div
          className="px-4 py-2 text-[11px] font-mono border-b"
          style={{ color: "#555", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {label}
        </div>
      )}
      <pre className="px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ color: "#D4D4D4" }}>
        {code}
      </pre>
    </div>
  );
}

function FieldTable({ fields }: { fields: { field: string; type: string; required: boolean; desc: string }[] }) {
  return (
    <Table className="border border-white/[0.08]">
      <TableHeader>
        <TableRow className="border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.02]">
          <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "#555" }}>field</TableHead>
          <TableHead className="text-[11px] font-mono h-auto py-2.5 w-20" style={{ color: "#555" }}>type</TableHead>
          <TableHead className="text-[11px] font-mono h-auto py-2.5 w-14" style={{ color: "#555" }}>req</TableHead>
          <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "#555" }}>description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((f) => (
          <TableRow key={f.field} className="border-white/[0.06] hover:bg-transparent">
            <TableCell className="py-3 align-top">
              <code className="font-mono text-xs" style={{ color: "#A0A0A0" }}>{f.field}</code>
            </TableCell>
            <TableCell className="py-3 align-top font-mono text-xs" style={{ color: "#555" }}>{f.type}</TableCell>
            <TableCell className="py-3 align-top text-xs" style={{ color: f.required ? "#F59E0B" : "#555" }}>
              {f.required ? "yes" : "no"}
            </TableCell>
            <TableCell className="py-3 align-top text-xs leading-relaxed" style={{ color: "#888" }}>{f.desc}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CostBadge({ cost }: { cost: number }) {
  const hi = cost >= 10;
  return (
    <Badge
      variant="outline"
      className="text-[11px] font-mono"
      style={{
        backgroundColor: hi ? "rgba(180,83,9,0.12)" : "rgba(255,255,255,0.06)",
        color: hi ? "#F59E0B" : "#A0A0A0",
        borderColor: hi ? "rgba(180,83,9,0.3)" : "rgba(255,255,255,0.1)",
      }}
    >
      {cost} credits
    </Badge>
  );
}

function LangTabs({
  path,
  method = "POST",
  activeLang,
  onSelect,
}: {
  path: string;
  method?: "GET" | "POST";
  activeLang: Lang;
  onSelect: (l: Lang) => void;
}) {
  return (
    <div style={{ backgroundColor: "#0D0D0D", border: "1px solid rgba(255,255,255,0.08)" }}>
      <Tabs value={activeLang} onValueChange={(v) => onSelect(v as Lang)}>
        <TabsList className="flex w-full justify-start border-b bg-transparent rounded-none h-auto p-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {LANGS.map((lang) => (
            <TabsTrigger
              key={lang}
              value={lang}
              className="px-4 py-2.5 text-xs font-mono whitespace-nowrap rounded-none border-none border-b-2 shadow-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              style={{
                color: lang === activeLang ? "#ffffff" : "#555",
                borderBottomColor: lang === activeLang ? "#ffffff" : "transparent",
              }}
            >
              {LANG_LABELS[lang]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* Code */}
      <pre className="px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ color: "#D4D4D4" }}>
        {snippet(path, activeLang, method)}
      </pre>
    </div>
  );
}

export default function DocsContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeLang, setActiveLang] = useState<Lang>("curl");

  return (
    <div style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF", minHeight: "100vh" }}>
      <Navbar isLoggedIn={isLoggedIn} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-14 flex gap-0">

        {/* Sidebar */}
        <aside
          className="hidden lg:block w-52 shrink-0 sticky self-start"
          style={{ top: "56px", height: "calc(100vh - 56px)", overflowY: "auto", paddingTop: "48px", paddingBottom: "48px" }}
        >
          <Button variant="ghost" size="sm" asChild className="gap-1 font-mono text-xs mb-8 px-0 text-muted hover:text-ink hover:bg-transparent hover:opacity-60">
            <a href="/">
              <ArrowLeft size={12} className="inline-block" /> contextforai
            </a>
          </Button>
          <nav className="space-y-0.5">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-xs py-1.5 font-mono transition-colors text-muted hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 py-16 lg:pl-16">

          {/* Page header */}
          <div className="mb-12">
            <p className="font-mono text-xs mb-3" style={{ color: "#555" }}>v1.0</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-3">API Reference</h1>
            <p className="text-sm leading-relaxed max-w-lg" style={{ color: "#A0A0A0" }}>
              A single REST API for extracting structured data from any URL.
              All endpoints accept JSON and return JSON.
            </p>
          </div>

          {/* Global language selector */}
          <div className="flex items-center gap-3 mb-16 flex-wrap">
            <span className="text-xs font-mono" style={{ color: "#555" }}>Language:</span>
            <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Lang)}>
              <TabsList className="bg-transparent p-0 h-auto gap-2 flex-wrap justify-start">
                {LANGS.map((lang) => (
                  <TabsTrigger
                    key={lang}
                    value={lang}
                    className="text-xs font-mono px-3 py-1.5 rounded-none border shadow-none bg-transparent data-[state=active]:shadow-none"
                    style={{
                      color: lang === activeLang ? "#000" : "#555",
                      backgroundColor: lang === activeLang ? "#F0F0F0" : "transparent",
                      borderColor: lang === activeLang ? "#F0F0F0" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {LANG_LABELS[lang]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Authentication */}
          <section id="authentication" className="mb-16 scroll-mt-20">
            <h2 className="text-base font-semibold text-white mb-1">Authentication</h2>
            <div className="h-px mb-6" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#A0A0A0" }}>
              All requests require your API key as a Bearer token in the{" "}
              <Inline>Authorization</Inline> header. Keys are prefixed with{" "}
              <Inline>cfai_</Inline>. Generate keys in the{" "}
              <a href="/dashboard/keys" className="underline underline-offset-2 hover:text-white transition-colors" style={{ color: "#888" }}>
                dashboard
              </a>.
            </p>
            <CodeBlock label="header" code={`Authorization: Bearer cfai_your_key_here`} />
            <p className="mt-3 text-xs font-mono" style={{ color: "#555" }}>
              Never expose your key in client-side code or public repositories.
            </p>
          </section>

          {/* Endpoints */}
          {ENDPOINTS.map((ep) => (
            <section key={ep.id} id={ep.id} className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[11px] font-mono" style={{ color: "#888", borderColor: "rgba(255,255,255,0.15)" }}>
                  {ep.method ?? "POST"}
                </Badge>
                <h2 className="font-mono text-base font-semibold text-white">{ep.path}</h2>
                <CostBadge cost={ep.cost} />
              </div>
              <div className="h-px mb-6" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />

              <p className="text-sm leading-relaxed mb-8" style={{ color: "#A0A0A0" }}>
                {ep.description}
              </p>

              <p className="text-[11px] font-mono uppercase tracking-widest mb-3" style={{ color: "#444" }}>
                {ep.method === "GET" ? "Query parameters" : "Request body"}
              </p>
              <div className="mb-8">
                <FieldTable fields={ep.request} />
              </div>

              <p className="text-[11px] font-mono uppercase tracking-widest mb-3" style={{ color: "#444" }}>
                Example
              </p>
              <div className="mb-8">
                <LangTabs path={ep.path} method={ep.method ?? "POST"} activeLang={activeLang} onSelect={setActiveLang} />
              </div>

              <p className="text-[11px] font-mono uppercase tracking-widest mb-3" style={{ color: "#444" }}>
                Response
              </p>
              <CodeBlock label="200 OK" code={ep.response} />
            </section>
          ))}

          {/* Error codes */}
          <section id="errors" className="mb-16 scroll-mt-20">
            <h2 className="text-base font-semibold text-white mb-1">Error codes</h2>
            <div className="h-px mb-6" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#A0A0A0" }}>
              All errors return a JSON body with <Inline>error</Inline> and <Inline>message</Inline> fields.
              Errors are never charged.
            </p>
            <div className="mb-6">
              <CodeBlock
                label="error shape"
                code={`{\n  "error": "unauthorized",\n  "message": "Missing or invalid API key."\n}`}
              />
            </div>
            <Table className="border border-white/[0.08]">
              <TableHeader>
                <TableRow className="border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.02]">
                  <TableHead className="text-[11px] font-mono h-auto py-2.5 w-14" style={{ color: "#555" }}>status</TableHead>
                  <TableHead className="text-[11px] font-mono h-auto py-2.5 w-40" style={{ color: "#555" }}>error</TableHead>
                  <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "#555" }}>description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ERRORS.map((e) => (
                  <TableRow key={e.code} className="border-white/[0.06] hover:bg-transparent">
                    <TableCell className="py-3 align-top font-mono text-xs" style={{ color: e.code >= 500 ? "#F87171" : "#A0A0A0" }}>
                      {e.code}
                    </TableCell>
                    <TableCell className="py-3 align-top">
                      <code className="font-mono text-xs" style={{ color: "#888" }}>{e.name}</code>
                    </TableCell>
                    <TableCell className="py-3 align-top text-xs leading-relaxed" style={{ color: "#555" }}>{e.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          {/* Rate limits */}
          <section id="rate-limits" className="mb-16 scroll-mt-20">
            <h2 className="text-base font-semibold text-white mb-1">Rate limits</h2>
            <div className="h-px mb-6" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#A0A0A0" }}>
              Limits are per API key, per minute, and reset on a rolling 60-second window.
              Heavier endpoints — <Inline>/v1/screenshot</Inline> and <Inline>/v1/branding</Inline> —
              run a headless browser and allow half the plan's rate. Exceeding a limit returns{" "}
              <Inline>429</Inline> with a <Inline>Retry-After</Inline> header.
            </p>
            <Table className="border border-white/[0.08]">
              <TableHeader>
                <TableRow className="border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.02]">
                  <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "#555" }}>plan</TableHead>
                  <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "#555" }}>standard endpoints</TableHead>
                  <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "#555" }}>screenshot / branding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(RATE_LIMITS).map(([plan, limit]) => (
                  <TableRow key={plan} className="border-white/[0.06] hover:bg-transparent">
                    <TableCell className="py-3 align-top text-xs font-mono capitalize" style={{ color: "#A0A0A0" }}>{plan}</TableCell>
                    <TableCell className="py-3 align-top text-xs font-mono" style={{ color: "#888" }}>{limit} req/min</TableCell>
                    <TableCell className="py-3 align-top text-xs font-mono" style={{ color: "#888" }}>{Math.max(5, Math.floor(limit / 2))} req/min</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          {/* Credits */}
          <section id="credits" className="mb-16 scroll-mt-20">
            <h2 className="text-base font-semibold text-white mb-1">Credits & billing</h2>
            <div className="h-px mb-6" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "#A0A0A0" }}>
              <p>
                Credits are consumed per successful request.{" "}
                <Inline>/v1/markdown</Inline>, <Inline>/v1/html</Inline>, <Inline>/v1/json</Inline>,{" "}
                <Inline>/v1/sitemap</Inline>, and <Inline>/v1/fonts</Inline> cost{" "}
                <strong className="text-white">5 credits</strong> each.{" "}
                <Inline>/v1/screenshot</Inline> and <Inline>/v1/branding</Inline> cost{" "}
                <strong className="text-white">10 credits</strong> each.
              </p>
              <p>
                Requests that return a 4xx or 5xx error are <strong className="text-white">never charged</strong>.
                Cached responses (same URL + endpoint within 1 hour) cost{" "}
                <strong className="text-white">0 credits</strong>.
              </p>
              <p>
                New accounts receive <strong className="text-white">500 free credits</strong> with no credit card required.
                The free plan renews <strong className="text-white">500 credits every 30 days</strong> for
                as long as the account stays on it. Every plan (free and paid) resets your credit
                balance to that plan's monthly allowance every 30 days from when it was granted
                (unused credits don't roll over). Yearly plans grant the full 12 months of
                credits upfront at a <strong className="text-white">20% discount</strong> off the
                monthly price, and don't reset for a year. One-time top-ups expire{" "}
                <strong className="text-white">30 days</strong> after purchase. Add
                credits or view usage in the{" "}
                <a href="/dashboard/billing" className="underline underline-offset-2 hover:text-white transition-colors" style={{ color: "#888" }}>
                  billing dashboard
                </a>.
              </p>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}
