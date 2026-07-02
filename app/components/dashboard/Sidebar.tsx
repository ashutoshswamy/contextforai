"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Key,
  BarChart2,
  CreditCard,
  LogOut,
  Terminal,
  History,
  ExternalLink,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/playground", label: "Playground", icon: Terminal },
  { href: "/dashboard/keys", label: "API Keys", icon: Key },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/usage", label: "Usage History", icon: History },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              active ? "bg-white/15 text-ink" : "text-ink/55 hover:text-ink hover:bg-white/10"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-ember rounded-r-full" />
            )}
            <Icon size={15} className="shrink-0 ml-1" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <a
        href="/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-ink/55 hover:text-ink hover:bg-white/10"
      >
        <ExternalLink size={15} className="shrink-0 ml-1" />
        <span>Docs</span>
      </a>
    </nav>
  );
}

function CreditsFooter({ credits, totalCredits }: { credits: number; totalCredits: number }) {
  return (
    <div className="px-5 py-4 border-t border-white/10">
      <div className="mb-4 bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between border border-white/10">
        <span className="text-xs text-ink/70">Credits</span>
        <span className="text-xs font-mono text-ink">
          <strong>{credits.toLocaleString()}</strong>{" "}
          <span className="text-ink/40">/ {totalCredits.toLocaleString()}</span>
        </span>
      </div>
      <div className="flex items-center justify-between">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-7 h-7",
              userButtonPopoverCard: "bg-surface border border-border shadow-xl shadow-black/50 rounded-none",
              userButtonPopoverMain: "bg-surface",
              userButtonPopoverActionButton: "text-muted hover:bg-raised hover:text-ink",
              userButtonPopoverActionButtonText: "text-muted",
              userButtonPopoverActionButtonIcon: "text-muted",
              userButtonPopoverFooter: "bg-raised border-t border-border",
              userPreviewMainIdentifier: "text-ink",
              userPreviewSecondaryIdentifier: "text-faint",
              userButtonPopoverCardActionButton: "hover:bg-raised",
            },
          }}
        />
        <SignOutButton>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-mono border-white/15 bg-transparent text-ink/70 hover:text-ember hover:border-ember/40"
          >
            <LogOut size={13} />
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}

export default function Sidebar({ credits = 0, totalCredits = 0 }: { credits?: number; totalCredits?: number }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-bg border-b border-border flex items-center justify-between px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="text-muted hover:text-ink" aria-label="Open menu">
              <Menu size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-violet border-white/10 p-0 flex flex-col [&>button]:text-ink/40">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="px-5 py-5 border-b border-white/10">
              <a href="/" className="font-mono text-sm font-semibold text-ink hover:text-ember transition-colors">
                contextforai
              </a>
            </div>
            <NavLinks pathname={pathname} />
            <Separator className="bg-white/10" />
            <CreditsFooter credits={credits} totalCredits={totalCredits} />
          </SheetContent>
        </Sheet>
        <a href="/" className="font-mono text-sm font-semibold text-ink">
          contextforai
        </a>
        <div className="w-8" />
      </div>

      {/* Sidebar — sticky on desktop only */}
      <aside className="hidden md:flex flex-col bg-violet shrink-0 md:sticky md:top-0 md:h-screen md:w-56">
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <a href="/" className="font-mono text-sm font-semibold text-ink hover:text-ember transition-colors">
            contextforai
          </a>
        </div>
        <NavLinks pathname={pathname} />
        <CreditsFooter credits={credits} totalCredits={totalCredits} />
      </aside>
    </>
  );
}
