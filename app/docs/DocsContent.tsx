"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ENDPOINTS } from "./endpoints";
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
      style={{ backgroundColor: "var(--raised)", color: "var(--muted)" }}
    >
      {children}
    </code>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "2px solid var(--bar)" }}>
      {label && (
        <div
          className="px-4 py-2 text-[11px] font-mono border-b"
          style={{ color: "var(--faint)", borderColor: "var(--line)" }}
        >
          {label}
        </div>
      )}
      <pre className="px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ color: "var(--ink)" }}>
        {code}
      </pre>
    </div>
  );
}

function FieldTable({ fields }: { fields: { field: string; type: string; required: boolean; desc: string }[] }) {
  return (
    <Table className="border border-border/[0.08]">
      <TableHeader>
        <TableRow className="border-border/[0.08] bg-raised hover:bg-raised">
          <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "var(--faint)" }}>field</TableHead>
          <TableHead className="text-[11px] font-mono h-auto py-2.5 w-20" style={{ color: "var(--faint)" }}>type</TableHead>
          <TableHead className="text-[11px] font-mono h-auto py-2.5 w-14" style={{ color: "var(--faint)" }}>req</TableHead>
          <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "var(--faint)" }}>description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((f) => (
          <TableRow key={f.field} className="border-border/[0.06] hover:bg-transparent">
            <TableCell className="py-3 align-top">
              <code className="font-mono text-xs" style={{ color: "var(--muted)" }}>{f.field}</code>
            </TableCell>
            <TableCell className="py-3 align-top font-mono text-xs" style={{ color: "var(--faint)" }}>{f.type}</TableCell>
            <TableCell className="py-3 align-top text-xs" style={{ color: f.required ? "var(--warn)" : "var(--faint)" }}>
              {f.required ? "yes" : "no"}
            </TableCell>
            <TableCell className="py-3 align-top text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{f.desc}</TableCell>
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
        backgroundColor: hi ? "color-mix(in oklab, var(--warn) 14%, transparent)" : "var(--line)",
        color: hi ? "var(--warn)" : "var(--muted)",
        borderColor: hi ? "color-mix(in oklab, var(--warn) 35%, transparent)" : "var(--line)",
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
    <div style={{ backgroundColor: "var(--surface)", border: "2px solid var(--bar)" }}>
      <Tabs value={activeLang} onValueChange={(v) => onSelect(v as Lang)}>
        <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar border-b bg-transparent rounded-md h-auto p-0" style={{ borderColor: "var(--line)" }}>
          {LANGS.map((lang) => (
            <TabsTrigger
              key={lang}
              value={lang}
              className="px-4 py-2.5 text-xs font-mono whitespace-nowrap rounded-none border-none border-b-2 shadow-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              style={{
                color: lang === activeLang ? "var(--ink)" : "var(--faint)",
                borderBottomColor: lang === activeLang ? "var(--ink)" : "transparent",
              }}
            >
              {LANG_LABELS[lang]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* Code */}
      <pre className="px-4 py-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ color: "var(--ink)" }}>
        {snippet(path, activeLang, method)}
      </pre>
    </div>
  );
}

export default function DocsContent({ only }: { only?: string }) {
  const eps = only ? ENDPOINTS.filter((e) => e.id === only) : ENDPOINTS;
  const base = only ? "/docs" : "";
  const [activeLang, setActiveLang] = useState<Lang>("curl");

  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--ink)", minHeight: "100vh" }}>
      <Navbar />

      <div className="wall mx-auto mt-6 max-w-[1400px] lg:grid-cols-[15rem_minmax(0,1fr)]">

        {/* Sidebar */}
        <aside
          className="pane hidden self-stretch lg:block"
        >
          <div className="sticky px-6 py-8" style={{ top: "56px", maxHeight: "calc(100vh - 56px)", overflowY: "auto" }}>
          <Button variant="ghost" size="sm" asChild className="mb-8 gap-1.5 px-0 text-muted hover:bg-transparent hover:text-ink">
            <a href="/">
              <ArrowLeft size={12} className="inline-block" /> Home
            </a>
          </Button>
          <nav className="space-y-0.5">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={base + item.href}
                className="block py-1.5 text-sm font-medium transition-colors text-muted hover:text-ink"
              >
                {item.label}
              </a>
            ))}
          </nav>
                  </div>
        </aside>

        {/* Main */}
        <main className="pane min-w-0 px-5 py-12 sm:px-10 lg:px-14 lg:py-14">

          {/* Page header */}
          <div className="mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-ink mb-3">{only ? `${eps[0].path} endpoint` : "API Reference"}</h1>
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: "var(--muted)" }}>
              {only
                ? eps[0].summary
                : "A single REST API for extracting structured data from any URL. All endpoints accept JSON and return JSON."}
            </p>
          </div>

          {/* Global language selector */}
          <div className="flex items-center gap-3 mb-16 flex-wrap">
            <span className="text-xs font-mono" style={{ color: "var(--faint)" }}>Language:</span>
            <Tabs value={activeLang} onValueChange={(v) => setActiveLang(v as Lang)}>
              <TabsList className="bg-transparent p-0 h-auto gap-2 flex-wrap justify-start">
                {LANGS.map((lang) => (
                  <TabsTrigger
                    key={lang}
                    value={lang}
                    className="text-xs font-mono px-3 py-1.5 rounded-md border shadow-none bg-transparent data-[state=active]:shadow-none"
                    style={{
                      color: lang === activeLang ? "var(--btn-ink)" : "var(--faint)",
                      backgroundColor: lang === activeLang ? "var(--btn)" : "transparent",
                      borderColor: lang === activeLang ? "var(--btn)" : "var(--line)",
                    }}
                  >
                    {LANG_LABELS[lang]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Authentication */}
          {!only && <section id="authentication" className="mb-16 scroll-mt-20">
            <h2 className="text-base font-semibold text-ink mb-1">Authentication</h2>
            <div className="h-px mb-6" style={{ backgroundColor: "var(--line)" }} />
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
              All requests require your API key as a Bearer token in the{" "}
              <Inline>Authorization</Inline> header. Keys are prefixed with{" "}
              <Inline>cfai_</Inline>. Generate keys in the{" "}
              <a href="/dashboard/keys" className="underline underline-offset-2 hover:text-ink transition-colors" style={{ color: "var(--muted)" }}>
                dashboard
              </a>.
            </p>
            <CodeBlock label="header" code={`Authorization: Bearer cfai_your_key_here`} />
            <p className="mt-3 text-xs font-mono" style={{ color: "var(--faint)" }}>
              Never expose your key in client-side code or public repositories.
            </p>
          </section>}

          {/* Endpoints */}
          {eps.map((ep) => (
            <section key={ep.id} id={ep.id} className="mb-16 scroll-mt-20">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[11px] font-mono" style={{ color: "var(--muted)", borderColor: "var(--line)" }}>
                  {ep.method ?? "POST"}
                </Badge>
                <h2 className="font-mono text-base font-semibold text-ink">{ep.path}</h2>
                <CostBadge cost={ep.cost} />
              </div>
              <div className="h-px mb-6" style={{ backgroundColor: "var(--line)" }} />

              <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--muted)" }}>
                {ep.description}
              </p>

              <p className="text-[11px] font-mono mb-3" style={{ color: "var(--faint)" }}>
                {ep.method === "GET" ? "Query parameters" : "Request body"}
              </p>
              <div className="mb-8">
                <FieldTable fields={ep.request} />
              </div>

              <p className="text-[11px] font-mono mb-3" style={{ color: "var(--faint)" }}>
                Example
              </p>
              <div className="mb-8">
                <LangTabs path={ep.path} method={ep.method ?? "POST"} activeLang={activeLang} onSelect={setActiveLang} />
              </div>

              <p className="text-[11px] font-mono mb-3" style={{ color: "var(--faint)" }}>
                Response
              </p>
              <CodeBlock label="200 OK" code={ep.response} />
            </section>
          ))}

          {!only && <>
          {/* Error codes */}
          <section id="errors" className="mb-16 scroll-mt-20">
            <h2 className="text-base font-semibold text-ink mb-1">Error codes</h2>
            <div className="h-px mb-6" style={{ backgroundColor: "var(--line)" }} />
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
              All errors return a JSON body with <Inline>error</Inline> and <Inline>message</Inline> fields.
              Errors are never charged.
            </p>
            <div className="mb-6">
              <CodeBlock
                label="error shape"
                code={`{\n  "error": "unauthorized",\n  "message": "Missing or invalid API key."\n}`}
              />
            </div>
            <Table className="border border-border/[0.08]">
              <TableHeader>
                <TableRow className="border-border/[0.08] bg-raised hover:bg-raised">
                  <TableHead className="text-[11px] font-mono h-auto py-2.5 w-14" style={{ color: "var(--faint)" }}>status</TableHead>
                  <TableHead className="text-[11px] font-mono h-auto py-2.5 w-40" style={{ color: "var(--faint)" }}>error</TableHead>
                  <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "var(--faint)" }}>description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ERRORS.map((e) => (
                  <TableRow key={e.code} className="border-border/[0.06] hover:bg-transparent">
                    <TableCell className="py-3 align-top font-mono text-xs" style={{ color: e.code >= 500 ? "var(--stop)" : "var(--muted)" }}>
                      {e.code}
                    </TableCell>
                    <TableCell className="py-3 align-top">
                      <code className="font-mono text-xs" style={{ color: "var(--muted)" }}>{e.name}</code>
                    </TableCell>
                    <TableCell className="py-3 align-top text-xs leading-relaxed" style={{ color: "var(--faint)" }}>{e.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          {/* Rate limits */}
          <section id="rate-limits" className="mb-16 scroll-mt-20">
            <h2 className="text-base font-semibold text-ink mb-1">Rate limits</h2>
            <div className="h-px mb-6" style={{ backgroundColor: "var(--line)" }} />
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>
              Limits are per API key, per minute, and reset on a rolling 60-second window.
              Heavier endpoints - <Inline>/v1/screenshot</Inline> and <Inline>/v1/branding</Inline> -
              run a headless browser and allow half the plan's rate. Exceeding a limit returns{" "}
              <Inline>429</Inline> with a <Inline>Retry-After</Inline> header.
            </p>
            <Table className="border border-border/[0.08]">
              <TableHeader>
                <TableRow className="border-border/[0.08] bg-raised hover:bg-raised">
                  <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "var(--faint)" }}>plan</TableHead>
                  <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "var(--faint)" }}>standard endpoints</TableHead>
                  <TableHead className="text-[11px] font-mono h-auto py-2.5" style={{ color: "var(--faint)" }}>screenshot / branding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(RATE_LIMITS).map(([plan, limit]) => (
                  <TableRow key={plan} className="border-border/[0.06] hover:bg-transparent">
                    <TableCell className="py-3 align-top text-xs font-mono capitalize" style={{ color: "var(--muted)" }}>{plan}</TableCell>
                    <TableCell className="py-3 align-top text-xs font-mono" style={{ color: "var(--muted)" }}>{limit} req/min</TableCell>
                    <TableCell className="py-3 align-top text-xs font-mono" style={{ color: "var(--muted)" }}>{Math.max(5, Math.floor(limit / 2))} req/min</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          {/* Credits */}
          <section id="credits" className="mb-16 scroll-mt-20">
            <h2 className="text-base font-semibold text-ink mb-1">Credits & billing</h2>
            <div className="h-px mb-6" style={{ backgroundColor: "var(--line)" }} />
            <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
              <p>
                Credits are consumed per successful request.{" "}
                <Inline>/v1/markdown</Inline>, <Inline>/v1/html</Inline>, <Inline>/v1/json</Inline>,{" "}
                <Inline>/v1/sitemap</Inline>, and <Inline>/v1/fonts</Inline> cost{" "}
                <strong className="text-ink">5 credits</strong> each.{" "}
                <Inline>/v1/screenshot</Inline> and <Inline>/v1/branding</Inline> cost{" "}
                <strong className="text-ink">10 credits</strong> each.
              </p>
              <p>
                Requests that return a 4xx or 5xx error are <strong className="text-ink">never charged</strong>.
                Cached responses (same URL + endpoint within 1 hour) cost{" "}
                <strong className="text-ink">0 credits</strong>.
              </p>
              <p>
                New accounts receive <strong className="text-ink">500 free credits</strong> with no credit card required.
                The free plan renews <strong className="text-ink">500 credits every 30 days</strong> for
                as long as the account stays on it. Every plan (free and paid) resets your credit
                balance to that plan's monthly allowance every 30 days from when it was granted
                (unused credits don't roll over). Yearly plans grant the full 12 months of
                credits upfront at a <strong className="text-ink">20% discount</strong> off the
                monthly price, and don't reset for a year. One-time top-ups expire{" "}
                <strong className="text-ink">30 days</strong> after purchase. Add
                credits or view usage in the{" "}
                <a href="/dashboard/billing" className="underline underline-offset-2 hover:text-ink transition-colors" style={{ color: "var(--muted)" }}>
                  billing dashboard
                </a>.
              </p>
            </div>
          </section>
          </>}

          {only && (
            <a href="/docs" className="text-sm font-medium underline underline-offset-4 hover:text-ink" style={{ color: "var(--muted)" }}>
              ← Full API reference: authentication, errors, rate limits, billing
            </a>
          )}

        </main>
      </div>

      <Footer />
    </div>
  );
}
