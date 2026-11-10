"use client";

import { useRef } from "react";
import { SignIn } from "@clerk/nextjs";
import { ConsentGate } from "@/components/consent-gate";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";

export default function SignInClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      ".anim-left",
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );

    tl.fromTo(
      ".anim-form",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col lg:flex-row bg-bg">
      {/* Left Panel: Branding & Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface  relative flex-col justify-between p-12 border-r border-border">
        {/* Top: Logo */}
        <div className="anim-left opacity-0">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 px-0 hover:bg-transparent">
            <a href="/">
              <ArrowLeft size={16} className="text-muted" /> contextforai
            </a>
          </Button>
        </div>

        {/* Middle: Content */}
        <div className="max-w-md">
          <h1 className="anim-left opacity-0 font-display text-5xl font-extrabold text-ink mb-6 leading-[1.1]">
            Turn the web into structured data.
          </h1>
          <p className="anim-left opacity-0 text-muted text-lg mb-10 leading-relaxed">
            One simple API to extract clean Markdown, JSON, sitemaps, screenshots, and brand assets from any URL.
          </p>

          <div className="space-y-4 font-mono text-sm">
            <div className="anim-left opacity-0 flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>One key for all seven endpoints</span>
            </div>
            <div className="anim-left opacity-0 flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>500 free credits every month</span>
            </div>
            <div className="anim-left opacity-0 flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>Only pay for successful extractions</span>
            </div>
          </div>
        </div>

        {/* Bottom: Snippet / Footer */}
        <div className="anim-left opacity-0 font-mono text-xs text-faint">
          © {new Date().getFullYear()} contextforai
        </div>
      </div>

      {/* Right Panel: Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="lg:hidden absolute top-6 left-6 anim-left opacity-0">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 px-0 text-faint hover:bg-transparent hover:text-ink">
            <a href="/">
              <ArrowLeft size={14} /> contextforai
            </a>
          </Button>
        </div>

        <div className="anim-form opacity-0 w-full max-w-[400px]">
          <ConsentGate>{() => (
          <SignIn
            appearance={{
              variables: { colorPrimary: "var(--btn)", colorForeground: "var(--ink)", colorBackground: "var(--surface)", colorInput: "var(--raised)", colorInputForeground: "var(--ink)", borderRadius: "2px", fontFamily: "var(--font-body), system-ui, sans-serif" },
              elements: {
                rootBox: "w-full", cardBox: "shadow-none rounded-sm border-2 border-bar",
                card: "bg-surface border-2 border-bar shadow-none rounded-sm w-full",
                headerTitle: "text-ink font-semibold text-2xl tracking-tight",
                headerSubtitle: "text-muted",
                socialButtonsBlockButton: "border border-border bg-raised text-muted hover:text-ink hover:border-ink/20 transition-colors rounded-md",
                dividerLine: "bg-border",
                dividerText: "text-faint font-mono text-xs ",
                formFieldLabel: "text-muted text-sm font-medium",
                formFieldInput: "bg-raised border-border text-ink placeholder:text-faint focus:border-ink rounded-md shadow-none",
                formButtonPrimary: "!bg-none bg-primary hover:opacity-90 text-primary-foreground font-medium transition-colors rounded-md shadow-none",
                footerActionLink: "text-ember hover:text-ember-hi font-medium",
                identityPreviewText: "text-muted",
                identityPreviewEditButton: "text-ember hover:text-ember-hi",
                formFieldInputShowPasswordButton: "text-muted hover:text-ink",
              },
            }}
          />
          )}</ConsentGate>
        </div>
      </div>
    </div>
  );
}
