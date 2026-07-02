"use client";

import { useRef } from "react";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";

export default function SignUpClient() {
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
      <div className="hidden lg:flex lg:w-1/2 bg-surface hero-grid relative flex-col justify-between p-12 border-r border-border">
        {/* Top: Logo */}
        <div className="anim-left opacity-0">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 font-mono text-sm font-semibold text-ink hover:opacity-80 hover:bg-transparent px-0">
            <a href="/">
              <ArrowLeft size={16} className="text-muted" /> contextforai
            </a>
          </Button>
        </div>

        {/* Middle: Content */}
        <div className="max-w-md">
          <h1 className="anim-left opacity-0 text-4xl font-semibold tracking-tight text-ink mb-6 leading-[1.1]">
            Start extracting the web today.
          </h1>
          <p className="anim-left opacity-0 text-muted text-lg mb-10 leading-relaxed">
            Create an account to get your API key and instantly access clean Markdown, JSON, sitemaps, screenshots, and brand assets.
          </p>

          <div className="space-y-4 font-mono text-sm">
            <div className="anim-left opacity-0 flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>Free tier included</span>
            </div>
            <div className="anim-left opacity-0 flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>Instant API key generation</span>
            </div>
            <div className="anim-left opacity-0 flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>Full dashboard analytics</span>
            </div>
          </div>
        </div>

        {/* Bottom: Snippet / Footer */}
        <div className="anim-left opacity-0 font-mono text-xs text-faint">
          © {new Date().getFullYear()} contextforai · industrial grade extraction
        </div>
      </div>

      {/* Right Panel: Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="lg:hidden absolute top-6 left-6 anim-left opacity-0">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 font-mono text-sm text-faint hover:text-ink px-0">
            <a href="/">
              <ArrowLeft size={14} /> contextforai
            </a>
          </Button>
        </div>

        <div className="anim-form opacity-0 w-full max-w-[400px]">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-surface border border-border shadow-2xl shadow-black/50 rounded-none w-full",
                headerTitle: "text-ink font-semibold text-2xl tracking-tight",
                headerSubtitle: "text-muted",
                socialButtonsBlockButton: "border border-border bg-raised text-muted hover:text-ink hover:border-ink/20 transition-colors rounded-none",
                dividerLine: "bg-border",
                dividerText: "text-faint font-mono text-xs uppercase tracking-widest",
                formFieldLabel: "text-muted text-sm font-medium",
                formFieldInput: "bg-raised border-border text-ink placeholder:text-faint focus:border-ink rounded-none shadow-none",
                formButtonPrimary: "bg-ember hover:bg-ember-hi text-white font-medium transition-colors rounded-none shadow-none",
                footerActionLink: "text-ember hover:text-ember-hi font-medium",
                identityPreviewText: "text-muted",
                identityPreviewEditButton: "text-ember hover:text-ember-hi",
                formFieldInputShowPasswordButton: "text-muted hover:text-ink",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
