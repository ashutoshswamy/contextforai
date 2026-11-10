"use client";

import { sileo } from "sileo";

import { useState } from "react";
import { Clipboard, Check } from "lucide-react";

// Syntax hues are drawn from the three glasses, pulled toward ink so they hold contrast on both grounds.
const mix = (v: string) => `color-mix(in oklab, var(${v}) 78%, var(--ink))`;
const C = {
  keyword: mix("--l-markdown"),
  string: mix("--l-json"),
  flag: "var(--warn)",
  url: mix("--l-markdown"),
  plain: "var(--ink)",
} as const;
type TokType = keyof typeof C;

const KW: Record<string, Set<string>> = {
  curl: new Set(["curl", "POST", "GET"]),
  node: new Set(["const", "await", "fetch", "method", "headers", "body", "console", "log", "JSON", "stringify"]),
  python: new Set(["import", "print"]),
  go: new Set(["package", "main", "import", "func", "map", "string", "defer"]),
};

function highlight(code: string, lang: string) {
  const kws = KW[lang] ?? new Set<string>();
  const re = /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(https?:\/\/[^\s'"\\]+)|(-{1,2}[A-Za-z][A-Za-z0-9-]*)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|([\s\S])/g;
  const parts: { type: TokType; text: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m[1] || m[2]) parts.push({ type: "string", text: m[0] });
    else if (m[3]) parts.push({ type: "url", text: m[0] });
    else if (m[4]) parts.push({ type: "flag", text: m[0] });
    else if (m[5]) parts.push({ type: kws.has(m[0]) ? "keyword" : "plain", text: m[0] });
    else parts.push({ type: "plain", text: m[0] });
  }
  return parts.map((p, i) => <span key={i} style={{ color: C[p.type] }}>{p.text}</span>);
}

const TABS = [
  { label: "curl", key: "curl" },
  { label: "Node.js", key: "node" },
  { label: "Python", key: "python" },
  { label: "Go", key: "go" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const SNIPPETS: Record<TabKey, string> = {
  curl: `curl -X POST https://contextforai.ashutoshswamy.in/v1/markdown \\
  -H "Authorization: Bearer cfai_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`,
  node: `const res = await fetch("https://contextforai.ashutoshswamy.in/v1/markdown", {
  method: "POST",
  headers: {
    "Authorization": "Bearer cfai_your_key_here",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ url: "https://example.com" }),
});
const data = await res.json();
console.log(data.markdown);`,
  python: `import httpx

response = httpx.post(
    "https://contextforai.ashutoshswamy.in/v1/markdown",
    headers={
        "Authorization": "Bearer cfai_your_key_here",
        "Content-Type": "application/json",
    },
    json={"url": "https://example.com"},
)
print(response.json()["markdown"])`,
  go: `package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func main() {
    body, _ := json.Marshal(map[string]string{
        "url": "https://example.com",
    })
    req, _ := http.NewRequest("POST",
        "https://contextforai.ashutoshswamy.in/v1/markdown",
        bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer cfai_your_key_here")
    req.Header.Set("Content-Type", "application/json")
    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()
}`,
};

const RESPONSE = `{
  "url": "https://example.com",
  "title": "Example Domain",
  "markdown": "# Example Domain\\n\\nThis domain is for...",
  "wordCount": 17
}`;

const STEPS = [
  { title: "Get a key", body: "Sign up and copy your Bearer token from the dashboard." },
  { title: "Send a URL", body: "POST it to any endpoint. We fetch the page server-side and extract what you asked for." },
  { title: "Use the output", body: "Feed Markdown to your model, store the JSON, or save the screenshot." },
];

export default function QuickstartSection() {
  const [tab, setTab] = useState<TabKey>("curl");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(SNIPPETS[tab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      sileo.success({ title: "Copied to clipboard" });
    } catch {
      sileo.error({ title: "Copy failed" });
    }
  }

  return (
    <section id="quickstart" className="scroll-mt-14 bg-bg pt-20 lg:pt-28">
      <div className="wall mx-auto max-w-[1400px] lg:grid-cols-12">
        <div className="pane flex flex-col justify-end p-6 sm:p-10 lg:col-span-5 lg:min-h-[17rem]">
          <h2 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">One request is the whole integration.</h2>
          <p className="mt-4 max-w-sm text-lg text-muted">No SDK to install. Anything that sends an HTTP request works.</p>
        </div>

        <div className="pane flex flex-col lg:col-span-7 lg:col-start-6 lg:row-span-4 lg:row-start-1">
          <div className="flex items-center border-b border-border pr-2">
            <div role="tablist" aria-label="Language" className="flex flex-1 overflow-x-auto no-scrollbar">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 border-b-2 px-5 py-4 text-sm font-semibold transition-colors ${tab === t.key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={copy} className="inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold text-muted hover:text-ink" aria-label="Copy code">
              {copied ? <Check size={14} /> : <Clipboard size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-6 text-[0.9rem] leading-relaxed no-scrollbar">{highlight(SNIPPETS[tab], tab)}</pre>
          <div className="mt-auto flex items-center gap-3 border-t border-border bg-raised px-6 py-3">
            <span className="text-sm font-semibold">Response</span>
            <span className="inline-flex h-6 items-center bg-[var(--go)] px-2 text-xs font-bold text-[var(--bg)]">200 OK</span>
          </div>
          <pre className="min-h-40 flex-none overflow-x-auto bg-raised px-6 pb-6 pt-1 text-[0.9rem] leading-relaxed text-muted no-scrollbar">{RESPONSE}</pre>
        </div>

        {STEPS.map((s) => (
          <div key={s.title} className="pane p-6 sm:px-10 lg:col-span-5">
            <h3 className="font-display text-xl font-bold">{s.title}</h3>
            <p className="mt-1.5 max-w-sm text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
