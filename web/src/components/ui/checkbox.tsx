import * as React from "react"
import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[5px] border border-white/15 bg-white/[0.04] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-blue)/0.4)] disabled:cursor-not-allowed disabled:opacity-50 hover:border-white/25 data-[state=checked]:border-[hsl(var(--accent-blue)/0.6)] data-[state=checked]:bg-[linear-gradient(135deg,hsl(217_91%_60%),hsl(187_95%_50%))] data-[state=checked]:text-white data-[state=checked]:shadow-[0_0_12px_hsl(var(--accent-blue)/0.5)]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
