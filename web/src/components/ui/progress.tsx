import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          background:
            "linear-gradient(90deg, hsl(217 91% 60%), hsl(187 95% 50%))",
          boxShadow: "0 0 12px hsl(217 91% 60% / 0.5)",
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
