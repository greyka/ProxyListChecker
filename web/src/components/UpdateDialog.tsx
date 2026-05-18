import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface UpdateDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function UpdateDialog({ open, onOpenChange }: UpdateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Update available
          </DialogTitle>
          <DialogDescription>
            A new release of ProxyListChecker is available on GitHub.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
          <Badge variant="outline" className="font-mono">v0.3.0</Badge>
          <span className="text-muted-foreground">→</span>
          <Badge className="font-mono">v0.4.0</Badge>
          <span className="ml-auto text-xs text-muted-foreground">published 2 hours ago</span>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm font-medium">What's new</div>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            <li>• Self-update via GitHub Releases (no manual download)</li>
            <li>• Automatic dead-source commenting (404 / empty)</li>
            <li>• SemVer scheme: 0.X.0 feature / 0.X.Y fix</li>
            <li>• CI builds release artifacts on tag push</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Later
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              toast.success("Update in progress…", {
                description: "Downloading v0.4.0 from GitHub Releases.",
              })
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Update now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
