import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Copy,
  Play,
  Save,
  Square,
  Trash2,
  Shuffle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { MOCK_PROXIES } from "@/lib/mock-data"
import type { Proxy } from "@/types"
import { toast } from "sonner"
import { useAppState } from "@/lib/app-state"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/EmptyState"
import { Table2 as Table2Icon } from "lucide-react"

const PAGE_SIZE = 12

function typeBadge(t: Proxy["type"]) {
  const cls: Record<string, string> = {
    HTTP: "bg-blue-500/12 text-blue-300 border-blue-500/25",
    HTTPS: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
    SOCKS4: "bg-amber-500/12 text-amber-300 border-amber-500/25",
    SOCKS5: "bg-violet-500/12 text-violet-300 border-violet-500/25",
  }
  return (
    <span
      className={`inline-flex h-5 items-center rounded-md border px-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase ${cls[t]}`}
    >
      {t}
    </span>
  )
}

function statusBadge(s: Proxy["status"]) {
  if (s === "OK")
    return (
      <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 text-[11px] font-medium text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153/0.8)]" />
        OK
      </span>
    )
  if (s === "FAIL")
    return (
      <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 text-[11px] font-medium text-rose-300">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgb(244_63_94/0.7)]" />
        FAIL
      </span>
    )
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 text-[11px] text-zinc-500">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
      —
    </span>
  )
}

function anonymityBadge(a: Proxy["anonymity"]) {
  const map: Record<string, string> = {
    transparent: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    anonymous: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    elite: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  }
  if (a === "transparent" || a === "anonymous" || a === "elite") {
    return (
      <span className={`inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] font-medium uppercase tracking-wider ${map[a]}`}>
        {a}
      </span>
    )
  }
  return <span className="text-zinc-500">—</span>
}

function latencyText(ms: number | null) {
  if (ms == null) return <span className="text-zinc-500">—</span>
  const cls = ms < 200 ? "text-emerald-300" : ms < 600 ? "text-amber-300" : "text-rose-300"
  return <span className={`font-mono tabular-nums ${cls}`}>{ms} ms</span>
}

export default function Results() {
  const { search, setStatus } = useAppState()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [anonFilter, setAnonFilter] = useState<string>("all")
  const [threads, setThreads] = useState(100)
  const [timeout, setTimeoutMs] = useState(5000)
  const [testUrl, setTestUrl] = useState("https://api.ipify.org")
  const [limit, setLimit] = useState(1000)
  const [shuffle, setShuffle] = useState(false)
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MOCK_PROXIES.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false
      if (typeFilter !== "all" && p.type !== typeFilter) return false
      if (anonFilter !== "all" && p.anonymity !== anonFilter) return false
      if (q) {
        const hay = `${p.host} ${p.port} ${p.exitIp ?? ""} ${p.source}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [search, statusFilter, typeFilter, anonFilter])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pages - 1)
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  const allSelected = visible.length > 0 && visible.every((p) => selected.has(p.id))

  const toggleAll = () => {
    const next = new Set(selected)
    if (allSelected) {
      visible.forEach((p) => next.delete(p.id))
    } else {
      visible.forEach((p) => next.add(p.id))
    }
    setSelected(next)
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const validateSelected = () => {
    if (selected.size === 0) {
      toast.warning("Select at least one proxy")
      return
    }
    setStatus("validating")
    toast.message(`Validating ${selected.size} proxies — ${threads} threads`)
    setTimeout(() => {
      setStatus("idle")
      toast.success(`Validation complete: ${Math.floor(selected.size * 0.4)} OK / ${selected.size}`)
    }, 1500)
  }

  if (MOCK_PROXIES.length === 0) {
    return (
      <EmptyState
        icon={Table2Icon}
        title="No proxies yet"
        description="Collect from your configured sources or add new ones to start validating."
        actions={
          <>
            <Button>Collect now</Button>
            <Button variant="outline">Add sources</Button>
          </>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="section-label">Validation</div>
          <h2 className="mt-1 text-[28px] font-semibold leading-none tracking-[-0.02em] text-white">
            Results
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400">
            <span className="font-mono tabular-nums text-zinc-200">
              {filtered.length.toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-mono tabular-nums text-zinc-200">
              {MOCK_PROXIES.length.toLocaleString()}
            </span>{" "}
            proxies shown
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="OK">OK</SelectItem>
                  <SelectItem value="FAIL">FAIL</SelectItem>
                  <SelectItem value="UNTESTED">Untested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="HTTP">HTTP</SelectItem>
                  <SelectItem value="HTTPS">HTTPS</SelectItem>
                  <SelectItem value="SOCKS4">SOCKS4</SelectItem>
                  <SelectItem value="SOCKS5">SOCKS5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Anonymity</Label>
              <Select value={anonFilter} onValueChange={setAnonFilter}>
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="anonymous">Anonymous</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Threads</Label>
              <Input
                type="number"
                value={threads}
                onChange={(e) => setThreads(Number(e.target.value))}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Timeout (ms)</Label>
              <Input
                type="number"
                value={timeout}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Limit</Label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="h-9 mt-1"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs">Test URL</Label>
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="h-9 mt-1 font-mono text-xs"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Switch checked={shuffle} onCheckedChange={setShuffle} id="shuffle" />
              <Label htmlFor="shuffle" className="flex items-center gap-1.5 text-sm">
                <Shuffle className="h-3.5 w-3.5" /> Shuffle
              </Label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button onClick={validateSelected}>
              <Play className="mr-2 h-4 w-4" /> Validate selected
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              Validate random N
            </Button>
            <Button variant="outline" disabled>
              <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
            <Button variant="outline" onClick={() => toast.success("Saved valid_proxies.txt")}>
              <Save className="mr-2 h-4 w-4" /> Save valid
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success(`Copied ${selected.size || filtered.length} proxies`)}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => toast.success("Purged failed proxies")}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Purge failed
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {selected.size > 0
              ? `${selected.size} selected`
              : `Page ${currentPage + 1} of ${pages}`}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Latency</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Exit IP</TableHead>
                <TableHead>Anonymity</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => (
                <TableRow key={p.id} data-state={selected.has(p.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggleOne(p.id)}
                    />
                  </TableCell>
                  <TableCell>{typeBadge(p.type)}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-right text-xs">
                    {latencyText(p.latency)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.host}:{p.port}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.exitIp ?? "—"}
                  </TableCell>
                  <TableCell>{anonymityBadge(p.anonymity)}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                    {p.source}
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No matching proxies. Try clearing filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validate 87,432 proxies?</DialogTitle>
            <DialogDescription>
              This will take ~14 min at {threads} threads with a {timeout}ms timeout.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground">Threads</div>
              <div className="font-mono text-lg">{threads}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-muted-foreground">Timeout</div>
              <div className="font-mono text-lg">{timeout} ms</div>
            </div>
            <div className="rounded-md border p-3 col-span-2">
              <div className="text-muted-foreground">Test URL</div>
              <div className="font-mono text-xs break-all">{testUrl}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmOpen(false)
                setStatus("validating")
                toast.message("Bulk validation started")
                setTimeout(() => {
                  setStatus("idle")
                  toast.success("Validation complete: 1,247 OK / 87,432 total in 14m 23s")
                }, 2500)
              }}
            >
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
