import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[13px] text-zinc-100 transition-[color,box-shadow,background,border-color] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-zinc-500 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[hsl(var(--accent-blue)/0.6)] focus-visible:bg-white/[0.06] focus-visible:ring-[3px] focus-visible:ring-[hsl(var(--accent-blue)/0.18)] focus-visible:shadow-[0_0_24px_hsl(var(--accent-blue)/0.18)]",
        "aria-invalid:border-rose-500/50 aria-invalid:ring-rose-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
