"use client";

import { useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Clipboard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

gsap.registerPlugin(ScrollTrigger);

// VS Code dark theme colors
const C = {
  keyword: "#569CD6",
  string: "#CE9178",
  flag: "#9CDCFE",
  url: "#4EC9B0",
  plain: "#D4D4D4",
} as const;

type TokType = keyof typeof C;

const KW: Record<string, Set<string>> = {
  curl: new Set(["curl", "POST", "GET"]),
  node: new Set(["const", "await", "fetch", "method", "headers", "body", "console", "log", "JSON", "stringify"]),
  python: new Set(["import", "print"]),
  go: new Set(["package", "main", "import", "func", "map", "string", "fmt", "bytes", "defer"]),
};

function highlight(code: string, lang: string): React.ReactNode {
  const kws = KW[lang] ?? new Set<string>();
  const parts: { type: TokType; text: string }[] = [];
  const re =
    /("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(https?:\/\/[^\s'"\\]+)|(-{1,2}[A-Za-z][A-Za-z0-9-]*)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|([^])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m[1] || m[2]) parts.push({ type: "string", text: m[0] });
    else if (m[3]) parts.push({ type: "url", text: m[0] });
    else if (m[4]) parts.push({ type: "flag", text: m[0] });
    else if (m[5]) parts.push({ type: kws.has(m[0]) ? "keyword" : "plain", text: m[0] });
    else parts.push({ type: "plain", text: m[0] });
  }
  return parts.map((p, i) => (
    <span key={i} style={{ color: C[p.type] }}>{p.text}</span>
  ));
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

const RESPONSE_JSON = `{
  "url": "https://example.com",
  "title": "Example Domain",
  "markdown": "# Example Domain\\n\\nThis domain is for...",
  "wordCount": 17,
  "extractedAt": "2026-07-01T10:00:00Z"
}`;

const STEPS = [
  {
    title: "Get your key",
    body: "Sign up, copy your Bearer token from the dashboard.",
  },
  {
    title: "Pick an endpoint",
    body: "/v1/markdown  /v1/json  /v1/sitemap  /v1/fonts  /v1/screenshot  /v1/branding",
  },
  {
    title: "POST a URL",
    body: "That's the entire integration.",
  },
];

export default function QuickstartSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const borderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const codePanelRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLPreElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [activeTab, setActiveTab] = useState(0);
  const [fading, setFading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const tab = tabRefs.current[activeTab];
    if (tab) setUnderline({ left: tab.offsetLeft, width: tab.offsetWidth });
  }, [activeTab]);

  function switchTab(i: number) {
    if (i === activeTab) return;
    setFading(true);
    setTimeout(() => {
      setActiveTab(i);
      setFading(false);
    }, 80);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SNIPPETS[TABS[activeTab].key]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable
    }
  }

  useGSAP(() => {
    const steps = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    const borders = borderRefs.current.filter(Boolean) as HTMLDivElement[];
    const panel = codePanelRef.current;
    const badge = badgeRef.current;
    const responseEl = responseRef.current;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(steps, { x: 0, opacity: 1 });
      gsap.set(borders, { scaleY: 1 });
      if (panel) gsap.set(panel, { clipPath: "inset(0 0 0% 0)" });
      if (responseEl) gsap.set(responseEl.querySelectorAll("span"), { opacity: 1 });
      if (badge) gsap.set(badge, { opacity: 1, color: "var(--color-go)" });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(steps, { x: -16, opacity: 0 });
      gsap.set(borders, { scaleY: 0, transformOrigin: "top center" });
      if (panel) gsap.set(panel, { clipPath: "inset(0 0 100% 0)" });
      if (responseEl) gsap.set(responseEl.querySelectorAll("span"), { opacity: 0 });
      if (badge) gsap.set(badge, { opacity: 0, color: "var(--color-ink)" });

      const tl = gsap.timeline({ paused: true });

      // 1. Steps + left borders simultaneously
      tl.to(steps, { x: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 0);
      tl.to(borders, { scaleY: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 0);

      // 2. Code panel clips in — starts 0.2s after step sequence
      if (panel) {
        tl.to(panel, { clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "power3.out" }, 0.2);
      }

      // 3. Response chars type in after clip
      if (responseEl) {
        tl.to(responseEl.querySelectorAll("span"), { opacity: 1, duration: 0, stagger: 0.008 }, ">");
      }

      // 4. Badge — white flash → green
      if (badge) {
        tl.to(badge, { opacity: 1, duration: 0.15, ease: "none" }, ">");
        tl.to(badge, { color: "var(--color-go)", duration: 0.15 }, ">");
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 65%",
        once: true,
        onEnter: () => tl.play(),
      });
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="quickstart"
      className="py-16 md:py-24 w-full"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">

          {/* Left column */}
          <div className="md:w-[45%] shrink-0">
            <h2 className="text-2xl font-semibold text-ink mb-8 tracking-tight">
              Up in 30 seconds.
            </h2>

            <div className="space-y-6">
              {STEPS.map((step, i) => (
                <div
                  key={i}
                  ref={(el) => { stepRefs.current[i] = el; }}
                  className="flex gap-4 items-stretch"
                >
                  <div
                    ref={(el) => { borderRefs.current[i] = el; }}
                    className="w-0.5 shrink-0 bg-border"
                  />
                  <div className="pb-1">
                    <p className="text-sm font-medium text-ink mb-1">{step.title}</p>
                    <p className="text-xs font-mono leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs font-mono text-faint">
              No SDK required. Works with fetch, axios, curl, httpx.
            </p>
          </div>

          {/* Right column — code panel */}
          <div ref={codePanelRef} className="flex-1 min-w-0 bg-surface">

            {/* Language tabs */}
            <Tabs value={TABS[activeTab].key} className="relative w-full">
              <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar border-b border-border bg-transparent rounded-none h-auto p-0">
                {TABS.map((tab, i) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    ref={(el) => { tabRefs.current[i] = el; }}
                    onClick={() => switchTab(i)}
                    className={`px-4 py-3 text-xs font-mono whitespace-nowrap shrink-0 rounded-none border-none shadow-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none ${
                      i === activeTab ? "text-ink" : "text-faint hover:text-muted"
                    }`}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}

                {/* Sliding underline */}
                <div
                  className="absolute bottom-0 h-px pointer-events-none bg-ink"
                  style={{
                    height: "2px",
                    left: underline.left,
                    width: underline.width,
                    transition: "left 0.2s ease, width 0.2s ease",
                  }}
                />

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopy}
                  className={`ml-auto mr-3 my-auto shrink-0 hover:bg-transparent ${
                    copied ? "text-go" : "text-faint hover:text-ink"
                  }`}
                  title="Copy"
                >
                  {copied ? <Check size={12} /> : <Clipboard size={12} />}
                </Button>
              </TabsList>
            </Tabs>

            {/* Code area */}
            <div
              className="px-5 py-5 overflow-auto"
              style={{ opacity: fading ? 0 : 1, transition: "opacity 80ms ease" }}
            >
              <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap">
                {highlight(SNIPPETS[TABS[activeTab].key], TABS[activeTab].key)}
              </pre>
            </div>

            {/* Response divider */}
            <div className="mx-5 flex items-center gap-3 py-2 border-t border-border">
              <span className="text-[11px] font-mono text-faint">
                response
              </span>
              <div className="flex-1 h-px bg-border" />
              <Badge ref={badgeRef} variant="outline" className="text-[11px] font-mono text-go border-transparent p-0">
                200 OK <Check size={12} className="inline-block mb-0.5" />
              </Badge>
            </div>

            {/* Response JSON — chars for typing animation */}
            <div className="px-5 pb-5 pt-1">
              <pre
                ref={responseRef}
                className="text-xs font-mono leading-relaxed whitespace-pre-wrap text-muted"
              >
                {RESPONSE_JSON.split("").map((ch, i) => (
                  <span key={i}>{ch}</span>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
