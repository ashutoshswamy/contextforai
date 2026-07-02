"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Endpoint = "markdown" | "html" | "json" | "sitemap" | "fonts" | "screenshot" | "branding";

const ENDPOINTS: Array<{
  id: Endpoint;
  path: string;
  method?: "GET" | "POST";
  cost: string;
  description: string;
}> = [
  { id: "markdown",   path: "/v1/markdown",   cost: "5 cr",  description: "Clean Markdown from main content" },
  { id: "html",       path: "/v1/html",        method: "GET", cost: "5 cr",  description: "Raw HTML, no parsing" },
  { id: "json",       path: "/v1/json",        cost: "5 cr",  description: "Structured data, metadata, OG tags" },
  { id: "sitemap",    path: "/v1/sitemap",     cost: "5 cr",  description: "Page list from sitemap.xml or crawl" },
  { id: "fonts",      path: "/v1/fonts",       cost: "5 cr",  description: "Font families from CSS and Google Fonts" },
  { id: "screenshot", path: "/v1/screenshot",  cost: "10 cr", description: "Headless browser screenshot" },
  { id: "branding",   path: "/v1/branding",    cost: "10 cr", description: "Logo, favicon, and brand color palette" },
];

export default function PlaygroundClient({ embedded = false }: { embedded?: boolean }) {
  const [apiKey, setApiKey] = useState("");
  const [url, setUrl] = useState("https://example.com");
  const [endpoint, setEndpoint] = useState<Endpoint>("markdown");
  const [fullPage, setFullPage] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<"response" | "code">("response");
  const [timing, setTiming] = useState<number | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const extraParams = endpoint === "screenshot" ? { fullPage, format } : {};
  const isGet = ENDPOINTS.find((e) => e.id === endpoint)?.method === "GET";

  const run = useCallback(async () => {
    if (!apiKey || !url) return;
    setLoading(true);
    setResult(null);
    setIsError(false);
    setTiming(null);
    setStatusCode(null);
    const t0 = performance.now();
    try {
      const res = isGet
        ? await fetch(`/api/v1/${endpoint}?url=${encodeURIComponent(url)}`, {
            headers: { Authorization: `Bearer ${apiKey}`, "X-Source": "playground" },
          })
        : await fetch(`/api/v1/${endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "X-Source": "playground",
            },
            body: JSON.stringify({ url, ...extraParams }),
          });
      setTiming(Math.round(performance.now() - t0));
      setStatusCode(res.status);
      const data = await res.json();
      setIsError(!res.ok);
      setResult(JSON.stringify(data, null, 2));
    } catch {
      setIsError(true);
      setResult("Network error");
    } finally {
      setLoading(false);
    }
  }, [apiKey, url, endpoint, extraParams, isGet]);

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const codeSnippet = isGet
    ? `curl "/api/v1/${endpoint}?url=${encodeURIComponent(url)}" \\
  -H "Authorization: Bearer ${apiKey || "<your-api-key>"}"`
    : `curl -X POST /api/v1/${endpoint} \\
  -H "Authorization: Bearer ${apiKey || "<your-api-key>"}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ url, ...extraParams }, null, 2)}'`;

  const outputText = activeTab === "code" ? codeSnippet : result ?? null;

  const controls = (
    <div className="space-y-3">
      <Card className="border-border p-4 gap-4">
        <div>
          <Label className="block text-xs font-mono text-faint uppercase tracking-widest mb-1.5">API Key</Label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="cfai_••••••••"
            className="font-mono bg-raised border-border text-ink placeholder:text-faint focus-visible:border-ember"
          />
        </div>
        <div>
          <Label className="block text-xs font-mono text-faint uppercase tracking-widest mb-1.5">URL</Label>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="https://example.com"
            maxLength={2048}
            className="font-mono bg-raised border-border text-ink placeholder:text-faint focus-visible:border-ember"
          />
        </div>
      </Card>
      <Card className="border-border p-4">
        <p className="text-xs font-mono text-faint uppercase tracking-widest mb-3">Endpoint</p>
        <div className="space-y-1">
          {ENDPOINTS.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setEndpoint(ep.id)}
              className={`w-full flex items-start justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                endpoint === ep.id
                  ? "bg-ember/10 border border-ember/30"
                  : "hover:bg-raised border border-transparent"
              }`}
            >
              <div className="min-w-0">
                <span
                  className={`text-xs font-mono font-medium ${endpoint === ep.id ? "text-ember" : "text-muted"}`}
                >
                  {ep.path}
                </span>
                <p className={`text-xs mt-0.5 truncate ${endpoint === ep.id ? "text-ember/70" : "text-faint"}`}>
                  {ep.description}
                </p>
              </div>
              <span className={`text-xs shrink-0 ml-2 mt-0.5 font-mono ${endpoint === ep.id ? "text-ember/70" : "text-faint"}`}>
                {ep.cost}
              </span>
            </button>
          ))}
        </div>

        {endpoint === "screenshot" && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted">Full page</span>
              <Switch
                checked={fullPage}
                onCheckedChange={setFullPage}
                className="data-[state=checked]:bg-ember"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted">Format</span>
              <Tabs value={format} onValueChange={(v) => setFormat(v as "png" | "jpeg")}>
                <TabsList className="h-auto bg-raised p-0.5">
                  {(["png", "jpeg"] as const).map((f) => (
                    <TabsTrigger
                      key={f}
                      value={f}
                      className="px-2.5 py-1 text-xs font-mono data-[state=active]:bg-ember data-[state=active]:text-white"
                    >
                      {f}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        )}
      </Card>
      <Button
        onClick={run}
        disabled={loading || !apiKey || !url}
        className="w-full py-2.5 h-auto bg-ember hover:bg-ember-hi disabled:opacity-40 text-white text-sm font-medium rounded-xl"
      >
        {loading ? "Running…" : <><span>Run</span><ArrowRight size={15} /></>}
      </Button>
    </div>
  );

  const responsePanel = (minHeightClass: string) => (
    <Card className={`border-border p-0 gap-0 flex flex-col overflow-hidden ${minHeightClass}`}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "response" | "code")}>
        <div className="flex items-center justify-between border-b border-border px-4 shrink-0">
          <TabsList className="bg-transparent h-auto p-0 gap-0">
            {(["response", "code"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-4 py-3 text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-ember data-[state=active]:bg-transparent data-[state=active]:text-ember data-[state=active]:font-medium text-faint capitalize shadow-none"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-3">
            {statusCode !== null && <span className={`text-xs font-mono ${statusCode < 300 ? "text-go" : "text-stop"}`}>{statusCode} · {timing}ms</span>}
            {outputText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(outputText)}
                className="h-auto p-0 text-xs text-faint hover:text-muted hover:bg-transparent"
              >
                {copied ? <span className="inline-flex items-center gap-1"><Check size={12} /> Copied</span> : "Copy"}
              </Button>
            )}
          </div>
        </div>
      </Tabs>
      <div className="flex-1 overflow-auto">
        {loading && <div className="flex items-center justify-center h-full"><p className="text-sm text-faint animate-pulse">Extracting…</p></div>}
        {!loading && activeTab === "response" && !result && <div className="flex flex-col items-center justify-center h-full gap-2"><p className="text-sm text-muted">Run a request to see the response</p><p className="text-xs text-faint">Enter a URL and API key, then click Run</p></div>}
        {!loading && activeTab === "response" && result && <pre className={`p-4 text-xs font-mono leading-relaxed h-full ${isError ? "text-stop" : "text-muted"}`}>{result}</pre>}
        {activeTab === "code" && <div className="p-4"><pre className="text-xs font-mono text-muted leading-relaxed whitespace-pre-wrap">{codeSnippet}</pre></div>}
      </div>
    </Card>
  );

  if (embedded) {
    return (
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4" style={{ minHeight: 600 }}>
          {controls}
          {responsePanel("min-h-[500px]")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border bg-bg shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-faint hover:text-muted transition-colors">
            <ArrowLeft size={13} /> contextforai
          </a>
          <span className="text-sm font-semibold text-ink">Playground</span>
          <div className="w-24" />
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-full">
          {controls}
          {responsePanel("min-h-[500px] lg:min-h-0")}
        </div>
      </div>
    </div>
  );
}
