import { cn } from "@/lib/utils"

export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("shimmer rounded-md bg-white/[0.04]", className)}
      {...props}
    />
  )
}
