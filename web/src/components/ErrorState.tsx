import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Something went wrong",
  message = "We hit an unexpected error while loading this view. You can try again — if it keeps failing, check the Logs page.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="mx-auto flex max-w-xl flex-col items-center gap-4 p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div>
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </Card>
  )
}
