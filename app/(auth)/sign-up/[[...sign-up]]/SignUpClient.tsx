"use client";

import { SignUp } from "@clerk/nextjs";
import { ConsentGate } from "@/components/consent-gate";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpClient() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg">
      {/* Left Panel: Branding & Marketing (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface  relative flex-col justify-between p-12 border-r border-border">
        {/* Top: Logo */}
        <div className="anim-left">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 px-0 hover:bg-transparent">
            <a href="/">
              <ArrowLeft size={16} className="text-muted" /> contextforai
            </a>
          </Button>
        </div>

        {/* Middle: Content */}
        <div className="max-w-md">
          <h1 className="anim-left font-display text-5xl font-extrabold text-ink mb-6 leading-[1.1]">
            Start extracting the web today.
          </h1>
          <p className="anim-left text-muted text-lg mb-10 leading-relaxed">
            Create an account to get your API key and instantly access clean Markdown, JSON, sitemaps, screenshots, and brand assets.
          </p>

          <div className="space-y-4 font-mono text-sm">
            <div className="anim-left flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>Free tier included</span>
            </div>
            <div className="anim-left flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>Instant API key generation</span>
            </div>
            <div className="anim-left flex items-center gap-3 text-ink">
              <CheckCircle2 size={16} className="text-go" />
              <span>Full dashboard analytics</span>
            </div>
          </div>
        </div>

        {/* Bottom: Snippet / Footer */}
        <div className="anim-left font-mono text-xs text-faint">
          © {new Date().getFullYear()} contextforai
        </div>
      </div>

      {/* Right Panel: Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="lg:hidden absolute top-6 left-6 anim-left">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 px-0 text-faint hover:bg-transparent hover:text-ink">
            <a href="/">
              <ArrowLeft size={14} /> contextforai
            </a>
          </Button>
        </div>

        <div className="anim-form w-full max-w-[400px]">
          <ConsentGate>{(legal) => (
          <SignUp unsafeMetadata={{ legal }}
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
