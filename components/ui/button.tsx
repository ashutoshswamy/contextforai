import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // One button system: rectilinear, semibold, no focus ring, a small press on :active.
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-transparent text-sm font-semibold whitespace-nowrap select-none outline-none transition-[background-color,color,border-color,opacity,transform] duration-200 ease-out pointer-coarse:min-h-11 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline: "border-bar bg-transparent text-ink hover:bg-raised aria-expanded:bg-raised",
        secondary: "bg-raised text-ink hover:border-bar",
        ghost: "text-ink hover:bg-raised aria-expanded:bg-raised",
        destructive: "bg-destructive text-[var(--bg)] hover:opacity-90",
        link: "h-auto border-0 px-0 text-ink underline decoration-2 underline-offset-[5px] hover:decoration-[var(--accent)]",
      },
      size: {
        default: "h-10 px-4",
        xs: "h-8 gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 px-3.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-6 text-base",
        icon: "size-10 px-0",
        "icon-xs": "size-8 px-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 px-0",
        "icon-lg": "size-12 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
