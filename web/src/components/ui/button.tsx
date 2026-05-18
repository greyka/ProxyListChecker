import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-[13px] font-medium tracking-tight whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-blue)/0.5)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "text-white bg-[linear-gradient(135deg,hsl(217_91%_58%),hsl(217_91%_48%))] shadow-[0_0_0_1px_hsl(217_91%_60%/0.35)_inset,0_8px_24px_-8px_hsl(217_91%_60%/0.6)] hover:shadow-[0_0_0_1px_hsl(217_91%_60%/0.5)_inset,0_0_24px_hsl(217_91%_60%/0.5),0_12px_28px_-8px_hsl(217_91%_60%/0.6)]",
        primary:
          "text-white bg-[linear-gradient(135deg,hsl(217_91%_58%),hsl(217_91%_48%))] shadow-[0_0_0_1px_hsl(217_91%_60%/0.35)_inset,0_8px_24px_-8px_hsl(217_91%_60%/0.6)] hover:shadow-[0_0_0_1px_hsl(217_91%_60%/0.5)_inset,0_0_24px_hsl(217_91%_60%/0.5),0_12px_28px_-8px_hsl(217_91%_60%/0.6)]",
        accent:
          "text-white bg-[linear-gradient(135deg,hsl(217_91%_60%),hsl(187_95%_50%))] shadow-[0_0_0_1px_hsl(187_95%_50%/0.3)_inset,0_8px_24px_-8px_hsl(187_95%_50%/0.55)] hover:shadow-[0_0_28px_hsl(187_95%_50%/0.55),0_12px_28px_-8px_hsl(187_95%_50%/0.55)]",
        glass:
          "text-zinc-100 bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.07] hover:border-white/[0.14]",
        outline:
          "text-zinc-100 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.14]",
        secondary:
          "text-zinc-100 bg-white/[0.05] hover:bg-white/[0.08]",
        ghost:
          "text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100",
        link:
          "text-[hsl(var(--accent-cyan))] underline-offset-4 hover:underline",
        destructive:
          "text-white bg-[linear-gradient(135deg,hsl(350_89%_60%),hsl(350_89%_50%))] shadow-[0_0_0_1px_hsl(350_89%_60%/0.35)_inset,0_8px_24px_-8px_hsl(350_89%_60%/0.6)] hover:shadow-[0_0_24px_hsl(350_89%_60%/0.5),0_12px_28px_-8px_hsl(350_89%_60%/0.6)]",
        danger:
          "text-rose-300 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/15 hover:text-rose-200 hover:shadow-[0_0_24px_hsl(350_89%_60%/0.35)]",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3.5",
        xs: "h-6 gap-1 rounded-md px-2 text-[11px] has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-xl px-5 has-[>svg]:px-4 text-[14px]",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-xl",
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
