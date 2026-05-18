import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actions?: ReactNode
}

export function EmptyState({ icon: Icon, title, description, actions }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <div className="text-base font-semibold tracking-tight">{title}</div>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="mt-2 flex flex-wrap items-center justify-center gap-2">{actions}</div>}
    </Card>
  )
}
