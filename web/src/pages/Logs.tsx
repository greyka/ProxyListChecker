import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, Trash2 } from "lucide-react"
import { MOCK_LOGS } from "@/lib/mock-data"
import type { LogLevel } from "@/types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const FILTERS: { id: LogLevel | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "info", label: "Info" },
  { id: "warn", label: "Warn" },
  { id: "error", label: "Error" },
  { id: "network", label: "Network" },
  { id: "discovery", label: "Discovery" },
]

const LEVEL_CLASS: Record<LogLevel, string> = {
  info: "text-foreground",
  warn: "text-amber-500",
  error: "text-destructive",
  network: "text-blue-500",
  discovery: "text-violet-400",
}

const LEVEL_TAG: Record<LogLevel, string> = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  network: " NET",
  discovery: " DSC",
}

export default function Logs() {
  const [filter, setFilter] = useState<LogLevel | "all">("all")
  const [logs, setLogs] = useState(MOCK_LOGS)

  const visible = useMemo(
    () => (filter === "all" ? logs : logs.filter((l) => l.level === filter)),
    [logs, filter],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="section-label">Diagnostics</div>
          <h2 className="mt-1 text-[28px] font-semibold leading-none tracking-[-0.02em] text-white">
            Logs
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400">
            <span className="font-mono tabular-nums text-zinc-200">{visible.length}</span>{" "}
            of <span className="font-mono tabular-nums text-zinc-200">{logs.length}</span> entries
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setLogs([])}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Copied logs to clipboard")}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Saved proxylistchecker.log")}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Badge
            key={f.id}
            variant={filter === f.id ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <pre className="px-4 py-3 font-mono text-xs leading-relaxed">
              {visible.length === 0 ? (
                <span className="text-muted-foreground">No log entries.</span>
              ) : (
                visible.map((l) => (
                  <div key={l.id} className="flex gap-3 py-0.5">
                    <span className="text-muted-foreground/70">{l.ts}</span>
                    <span className={cn("shrink-0 font-semibold", LEVEL_CLASS[l.level])}>
                      [{LEVEL_TAG[l.level]}]
                    </span>
                    <span className="whitespace-pre-wrap break-all">{l.message}</span>
                  </div>
                ))
              )}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
