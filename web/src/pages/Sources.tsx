import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  GripVertical,
  Plus,
  Trash2,
  Wand2,
  FolderGit2 as Github,
  ExternalLink,
  Clipboard,
} from "lucide-react"
import { MOCK_SOURCES } from "@/lib/mock-data"
import { toast } from "sonner"
import type { SourceUrl } from "@/types"
import { useAppState } from "@/lib/app-state"

function statusDot(status: SourceUrl["lastFetch"]) {
  const map = {
    ok: "bg-emerald-500",
    "404": "bg-destructive",
    timeout: "bg-amber-500",
    pending: "bg-muted-foreground",
  }
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${map[status]}`}
      title={status}
    />
  )
}

function typeBadge(t: SourceUrl["detectedType"]) {
  const cls: Record<string, string> = {
    HTTP: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    HTTPS: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    SOCKS4: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    SOCKS5: "bg-violet-500/15 text-violet-500 border-violet-500/30",
    MIXED: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    AUTO: "bg-muted text-muted-foreground border-border",
  }
  return (
    <Badge variant="outline" className={`${cls[t]} h-5 px-1.5 text-[10px]`}>
      {t}
    </Badge>
  )
}

export default function Sources() {
  const [sources, setSources] = useState<SourceUrl[]>(MOCK_SOURCES)
  const [discovering, setDiscovering] = useState(false)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState("")
  const { setStatus } = useAppState()

  const handleDiscover = () => {
    setDiscovering(true)
    setStatus("discovering")
    setTimeout(() => {
      setDiscovering(false)
      setStatus("idle")
      toast.success("Added 24 new sources via auto-discovery", {
        description: "From GitHub search across 52 repositories.",
      })
    }, 1500)
  }

  const handleRemove = (id: string) => {
    setSources((s) => s.filter((x) => x.id !== id))
  }

  const handleToggle = (id: string) => {
    setSources((s) => s.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)))
  }

  const handleAdd = () => {
    setSources((s) => [
      ...s,
      {
        id: `s${Date.now()}`,
        url: "",
        detectedType: "AUTO",
        lastFetch: "pending",
        count: 0,
        enabled: true,
      },
    ])
  }

  const handlePasteSubmit = () => {
    const lines = pasteText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s && s.startsWith("http"))
    if (lines.length === 0) {
      toast.warning("No valid URLs detected")
      return
    }
    setSources((cur) => [
      ...cur,
      ...lines.map((url, i) => ({
        id: `bulk-${Date.now()}-${i}`,
        url,
        detectedType: "AUTO" as const,
        lastFetch: "pending" as const,
        count: 0,
        enabled: true,
      })),
    ])
    setPasteText("")
    setPasteOpen(false)
    toast.success(`Added ${lines.length} URLs`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="section-label">Configuration</div>
          <h2 className="mt-1 text-[28px] font-semibold leading-none tracking-[-0.02em] text-white">
            Sources
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400">
            Public proxy list URLs. Auto-discover scans GitHub for repos matching
            common proxy-list patterns.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPasteOpen(true)}>
            <Clipboard className="mr-2 h-4 w-4" /> Paste bulk
          </Button>
          <Button onClick={handleDiscover} disabled={discovering}>
            <Wand2 className="mr-2 h-4 w-4" />
            {discovering ? "Searching…" : "Auto-discover (GitHub)"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">URL list</CardTitle>
          <span className="text-xs text-muted-foreground">
            {sources.filter((s) => s.enabled).length} enabled · {sources.length} total
          </span>
        </CardHeader>
        <CardContent className="space-y-1">
          {sources.map((s) => (
            <div
              key={s.id}
              className="group flex items-center gap-2 rounded-md border bg-card/40 px-2 py-1.5 transition-colors hover:bg-muted/50"
            >
              <button className="cursor-grab text-muted-foreground/60 hover:text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="shrink-0">{statusDot(s.lastFetch)}</span>
              {typeBadge(s.detectedType)}
              <Input
                defaultValue={s.url}
                placeholder="https://…"
                className="h-8 flex-1 font-mono text-xs"
              />
              <span className="hidden w-24 text-right font-mono text-[11px] text-muted-foreground sm:inline">
                {s.count > 0 ? s.count.toLocaleString() : "—"}
              </span>
              <Switch checked={s.enabled} onCheckedChange={() => handleToggle(s.id)} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.open(s.url, "_blank")}
                aria-label="Open"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive/80 hover:text-destructive"
                onClick={() => handleRemove(s.id)}
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          <Button
            variant="ghost"
            className="mt-2 w-full justify-start text-muted-foreground"
            onClick={handleAdd}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add source URL
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <Github className="h-4 w-4" />
          Tip: set a <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">GITHUB_TOKEN</code> in Settings to raise the GitHub API rate limit from 60 to 5000 req/hour.
        </CardContent>
      </Card>

      <Sheet open={pasteOpen} onOpenChange={setPasteOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Paste bulk URLs</SheetTitle>
            <SheetDescription>
              One URL per line. Lines that don't start with http will be ignored.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={14}
              placeholder={`https://raw.githubusercontent.com/...\nhttps://api.proxyscrape.com/...`}
              className="font-mono text-xs"
            />
          </div>
          <SheetFooter>
            <Button variant="ghost" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasteSubmit}>Add URLs</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
