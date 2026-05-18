import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--accent-blue)/0.15)] text-[hsl(var(--accent-blue))] border-[hsl(var(--accent-blue)/0.3)]",
        secondary:
          "bg-white/[0.06] text-zinc-200 border-white/[0.08]",
        destructive:
          "bg-rose-500/15 text-rose-300 border-rose-500/30",
        outline:
          "border-white/[0.1] text-zinc-200 [a&]:hover:bg-white/[0.05]",
        ghost: "[a&]:hover:bg-white/[0.05] text-zinc-300",
        link: "text-[hsl(var(--accent-cyan))] underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
