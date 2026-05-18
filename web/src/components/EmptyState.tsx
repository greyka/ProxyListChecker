import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actions?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="glass-panel mx-auto flex max-w-xl flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="relative">
        <div
          className="grid h-16 w-16 place-items-center rounded-2xl text-white"
          style={{
            background:
              "linear-gradient(135deg, hsl(217 91% 60% / 0.18), hsl(187 95% 50% / 0.18))",
            border: "1px solid hsl(0 0% 100% / 0.1)",
            boxShadow:
              "0 0 32px hsl(217 91% 60% / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.08)",
          }}
        >
          <Icon className="h-6 w-6 text-[hsl(var(--accent-cyan))]" />
        </div>
      </div>
      <div>
        <div className="text-[18px] font-semibold tracking-tight text-white">{title}</div>
        <p className="mt-1.5 max-w-md text-[13px] text-zinc-400">{description}</p>
      </div>
      {actions && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div>
      )}
    </div>
  )
}
