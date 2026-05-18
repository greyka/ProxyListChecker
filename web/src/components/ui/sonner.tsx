"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-[hsl(var(--glass-bg))] !backdrop-blur-xl !border !border-white/10 !rounded-xl !text-zinc-100 !shadow-[0_24px_48px_-24px_rgba(0,0,0,0.6),0_0_1px_hsl(0_0%_100%/0.06)_inset]",
          description: "!text-zinc-400",
          actionButton: "!bg-[hsl(var(--accent-blue))] !text-white",
          cancelButton: "!bg-white/[0.06] !text-zinc-300",
          success: "[&>[data-icon]]:!text-emerald-400",
          error: "[&>[data-icon]]:!text-rose-400",
          warning: "[&>[data-icon]]:!text-amber-400",
          info: "[&>[data-icon]]:!text-blue-400",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
