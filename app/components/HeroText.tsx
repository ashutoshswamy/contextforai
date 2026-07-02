"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

gsap.registerPlugin(ScrollTrigger);

function generateResponseJson(tab: string, url: string): string {
  const cleanUrl = url.trim() || "https://example.com";
  let domain = "Example Domain";
  try {
    if (cleanUrl.startsWith("http")) {
      const parsed = new URL(cleanUrl);
      domain = parsed.hostname.replace("www.", "");
      domain = domain.charAt(0).toUpperCase() + domain.slice(1);
    } else {
      domain = cleanUrl;
    }
  } catch (e) {
    domain = cleanUrl;
  }

  if (tab === "markdown") {
    return `{
  "url": "${cleanUrl}",
  "title": "${domain}",
  "markdown": "# ${domain}\\n\\nThis page content has been parsed into clean markdown. Non-essential sections like headers, footers, navigation links, and ads were automatically stripped for RAG pipeline ingestion.\\n\\nReady for AI tools.",
  "wordCount": 38,
  "extractedAt": "2026-07-01T10:00:00Z"
}`;
  } else if (tab === "json") {
    return `{
  "url": "${cleanUrl}",
  "title": "${domain}",
  "metadata": {
    "description": "Clean structured page data extracted from ${domain}",
    "og:title": "${domain}",
    "og:type": "website"
  },
  "headings": [
    { "level": 1, "text": "${domain}" }
  ],
  "links": [
    { "text": "Contact", "href": "/contact" }
  ]
}`;
  } else if (tab === "screenshot") {
    return `{
  "url": "${cleanUrl}",
  "screenshotUrl": "https://contextforai.ashutoshswamy.in/screenshots/screenshot.png",
  "dimensions": { "width": 1280, "height": 800 },
  "format": "png",
  "extractedAt": "2026-07-01T10:00:00Z"
}`;
  } else if (tab === "sitemap") {
    return `{
  "url": "${cleanUrl}",
  "source": "${cleanUrl}/sitemap.xml",
  "pages": [
    { "url": "${cleanUrl}/", "lastmod": "2026-06-28" },
    { "url": "${cleanUrl}/about", "lastmod": "2026-06-29" },
    { "url": "${cleanUrl}/pricing", "lastmod": "2026-06-30" }
  ],
  "count": 3
}`;
  } else if (tab === "fonts") {
    return `{
  "url": "${cleanUrl}",
  "fonts": ["Inter", "Geist Sans", "Geist Mono"],
  "count": 3,
  "extractedAt": "2026-07-01T10:00:00Z"
}`;
  } else if (tab === "branding") {
    return `{
  "url": "${cleanUrl}",
  "logo": "https://${cleanUrl.replace(/https?:\/\/(www\.)?/, "")}/logo.svg",
  "colors": [
    { "name": "primary", "hex": "#5B47E5" },
    { "name": "secondary", "hex": "#05B77E" }
  ]
}`;
  }
  return "";
}

export default function HeroText({ isLoggedIn }: { isLoggedIn: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const introCompleted = useRef(false);

  const [selectedTab, setSelectedTab] = useState<"markdown" | "json" | "screenshot">("markdown");
  const [placeholderText, setPlaceholderText] = useState("");
  const [showFakeCursor, setShowFakeCursor] = useState(true);
  const [badgeState, setBadgeState] = useState<"idle" | "flash" | "success">("idle");
  const [responseJson, setResponseJson] = useState(() => generateResponseJson("markdown", "https://example.com"));

  // Sync state for responsive JSON content
  useEffect(() => {
    setResponseJson(generateResponseJson(selectedTab, "https://example.com"));
  }, [selectedTab]);

  const jsonChars = responseJson.split("");

  // Stagger typing animation for subsequent interactions
  useEffect(() => {
    if (!responseJson) return;
    if (introCompleted.current) {
      gsap.set(".json-char", { opacity: 0 });
      setBadgeState("flash");

      const tl = gsap.timeline();
      tl.to(".ok-badge", {
        scale: 1.05,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      });

      tl.to(".json-char", {
        opacity: 1,
        stagger: 0.003,
        duration: 0.05,
        ease: "none",
        onComplete: () => {
          setBadgeState("success");
        }
      }, 0.05);
    }
  }, [responseJson]);

  const skipIntro = () => {
    if (!introCompleted.current) {
      if (introTimelineRef.current) {
        introTimelineRef.current.kill();
      }
      gsap.set("#hero-bg, .line-span, .subtext, .cta-button, .terminal-card", {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1
      });
      setPlaceholderText("https://example.com");
      setShowFakeCursor(true);
      setBadgeState("success");
      gsap.set(".json-char", { opacity: 1 });
      introCompleted.current = true;
    }
  };

  const handleTabChange = (tab: typeof selectedTab) => {
    skipIntro();
    setSelectedTab(tab);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          onComplete: () => {
            introCompleted.current = true;
          }
        });
        introTimelineRef.current = tl;

        // 1. (0s) Background fades in: opacity 0 -> 1 over 0.3s
        tl.to("#hero-bg", { opacity: 1, duration: 0.3 }, 0);

        // 3. (0.2s) Heading: line by line translate y:100% -> y:0
        tl.to(
          ".line-span",
          {
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out"
          },
          0.2
        );

        // 4. (0.5s) Subtext: opacity 0 -> 1, y: 8 -> 0
        tl.fromTo(
          ".subtext",
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.5 },
          0.5
        );

        // 5. (0.7s) CTAs: slide in from x: -8, opacity 0 -> 1, stagger 0.08s
        tl.fromTo(
          ".cta-button",
          { x: -8, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
          0.7
        );

        // 6. (0.4s, parallel) Terminal card: y: 24 -> 0, opacity 0 -> 1, duration 0.7s
        tl.fromTo(
          ".terminal-card",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
          0.4
        );

        // 6.b Cursor blinks 3 times (takes ~0.45s) starting at 0.6s
        tl.to({}, { duration: 0.075, onStart: () => setShowFakeCursor(false) }, 0.6);
        tl.to({}, { duration: 0.075, onStart: () => setShowFakeCursor(true) }, 0.675);
        tl.to({}, { duration: 0.075, onStart: () => setShowFakeCursor(false) }, 0.75);
        tl.to({}, { duration: 0.075, onStart: () => setShowFakeCursor(true) }, 0.825);
        tl.to({}, { duration: 0.075, onStart: () => setShowFakeCursor(false) }, 0.9);
        tl.to({}, { duration: 0.075, onStart: () => setShowFakeCursor(true) }, 0.975);

        // 7. Placeholder text types itself in at 1.05s
        const placeholderObj = { charCount: 0 };
        const fullPlaceholder = "https://example.com";
        tl.to(
          placeholderObj,
          {
            charCount: fullPlaceholder.length,
            duration: fullPlaceholder.length * 0.04,
            ease: "none",
            onUpdate: () => {
              setPlaceholderText(fullPlaceholder.substring(0, Math.floor(placeholderObj.charCount)));
            }
          },
          1.05
        );

        // 6.c JSON response types in character by character starting at 1.1s
        tl.to(
          ".json-char",
          {
            opacity: 1,
            stagger: 0.006,
            duration: 0.05,
            ease: "none",
            onComplete: () => {
              setBadgeState("success");
            }
          },
          1.1
        );

        // Badge pulse animation at 1.8s
        tl.to(
          ".ok-badge",
          {
            scale: 1.05,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: "power2.out"
          },
          1.8
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("#hero-bg, .line-span, .subtext, .cta-button, .terminal-card", {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1
        });
        setPlaceholderText("https://example.com");
        setShowFakeCursor(true);
        setBadgeState("success");
        gsap.set(".json-char", { opacity: 1 });
        introCompleted.current = true;
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="w-full">
      <div className="flex flex-col md:flex-row gap-12 items-start justify-between">
        {/* Left Column ~55% */}
        <div className="w-full md:w-[55%] flex flex-col items-start text-left shrink-0">
          <h1 className="font-sans font-bold tracking-tight text-white leading-[1.1] mb-6 text-4xl sm:text-5xl lg:text-6xl text-left select-none">
            <div className="overflow-hidden block py-0.5">
              <span className="line-span inline-block translate-y-[100%]">One API to</span>
            </div>
            <div className="overflow-hidden block py-0.5">
              <span className="line-span inline-block translate-y-[100%] text-white">extract the web.</span>
            </div>
          </h1>

          <p className="subtext text-muted text-base sm:text-lg mb-8 max-w-xl text-left leading-relaxed opacity-0">
            Feed any URL — get clean Markdown, structured JSON, a site map, a
            screenshot, or brand assets. Built for AI pipelines and content tools.
          </p>

          <div className="flex flex-wrap items-center justify-start gap-[12px] mb-6">
            <Button
              asChild
              size="lg"
              className="cta-button gap-2 bg-white hover:bg-white/90 text-black text-sm font-semibold shadow-sm opacity-0 h-auto py-2.5 px-5"
            >
              <a href={isLoggedIn ? "/dashboard/playground" : "/sign-up"}>
                {isLoggedIn ? "Open Playground" : "Get started free"}
                <ArrowRight size={15} />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="cta-button border-white/40 hover:border-white/60 bg-transparent text-white text-sm font-semibold shadow-sm opacity-0 h-auto py-2.5 px-5"
            >
              <a href={isLoggedIn ? "/dashboard" : "#endpoints"}>
                {isLoggedIn ? "Dashboard" : "See endpoints"}
              </a>
            </Button>
          </div>

        </div>

        {/* Right Column ~45% */}
        <div className="w-full md:w-[45%] md:translate-y-6">
          <div className="terminal-card w-full rounded-lg overflow-hidden border border-white/10 shadow-2xl shadow-black/80 bg-surface opacity-0">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-raised border-b border-white/5 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                <span className="ml-2.5 text-[11px] font-mono text-white/40">
                  contextforai — /v1/{selectedTab}
                </span>
              </div>
            </div>

            {/* HTTP Request Row (static preview, not editable) */}
            <div className="bg-surface px-4 py-3 border-b border-white/5 select-none">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-white/50 shrink-0">POST</span>

                <div className="relative flex-1 flex items-center h-5 min-w-0 overflow-hidden">
                  <span className="text-sm font-mono text-white/70">{placeholderText}</span>
                  <span className={`${showFakeCursor ? "opacity-100" : "opacity-0"} w-px h-3.5 bg-white/80 inline-block ml-px`} />
                </div>
              </div>
            </div>

            {/* Endpoint Tabs Row */}
            <div className="bg-raised/50 px-4 py-2 border-b border-white/5 flex items-center justify-between gap-4 select-none">
              <Tabs value={selectedTab} onValueChange={(v) => handleTabChange(v as typeof selectedTab)} className="w-full">
                <TabsList className="bg-transparent p-0 h-auto gap-1.5 overflow-x-auto no-scrollbar justify-start w-full">
                  {(["markdown", "json", "screenshot"] as const).map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="px-2.5 py-1 text-[11px] font-mono rounded-[4px] whitespace-nowrap text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-white/10 data-[state=active]:shadow-none"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Badge className={`ok-badge rounded text-[10px] font-mono font-bold transition-all duration-200 shrink-0 border ${
                badgeState === "flash" || badgeState === "success"
                  ? "bg-go/20 text-go border-go/30"
                  : "bg-white/5 text-white/40 border-white/5"
              }`}>
                200 OK
              </Badge>
            </div>

            {/* Response Area */}
            <div className="bg-raised relative overflow-hidden">
              <pre className="p-4 text-[11px] font-mono text-white/70 overflow-x-auto leading-relaxed select-text min-h-[220px] max-h-[300px] overflow-y-auto no-scrollbar">
                {jsonChars.map((char, index) => (
                  <span key={index} className="json-char opacity-0 inline">
                    {char}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
