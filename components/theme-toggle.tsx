"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Laptop },
] as const;

const noop = () => () => {};

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme = "system", resolvedTheme, setTheme } = useTheme();
  // resolvedTheme is undefined on the server; avoid hydration mismatch on the icon.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const Icon = !mounted ? Sun : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className={`inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember data-[state=open]:bg-white/10 ${className}`}
      >
        <Icon size={18} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 min-w-40">
        {OPTIONS.map(({ value, label, Icon: I }) => (
          <DropdownMenuItem key={value} onSelect={() => setTheme(value)} className="gap-2">
            <I size={15} aria-hidden />
            {label}
            {mounted && theme === value && <Check size={14} className="ml-auto" aria-hidden />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
