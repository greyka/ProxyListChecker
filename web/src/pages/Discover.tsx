import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Play, Square, FolderGit2 as Github, Star, Plus, Wand2 } from "lucide-react"
import { MOCK_DISCOVERY } from "@/lib/mock-data"
import { toast } from "sonner"
import { useAppState } from "@/lib/app-state"
import { EmptyState } from "@/components/EmptyState"

const DEFAULT_QUERIES = ["proxy-list", "free-proxy", "socks5-proxy", "http-proxies"]

export default function Discover() {
  const [queries, setQueries] = useState<string[]>(DEFAULT_QUERIES)
  const [newQuery, setNewQuery] = useState("")
  const [maxResults, setMaxResults] = useState(50)
  const [running, setRunning] = useState(false)
  const [hasResults, setHasResults] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { setStatus } = useAppState()

  const addQuery = () => {
    if (!newQuery.trim()) return
    setQueries((q) => [...q, newQuery.trim()])
    setNewQuery("")
  }

  const removeQuery = (q: string) => {
    setQueries((cur) => cur.filter((x) => x !== q))
  }

  const start = () => {
    setRunning(true)
    setStatus("discovering")
    setHasResults(false)
    setTimeout(() => {
      setHasResults(true)
      setRunning(false)
      setStatus("idle")
      toast.success(`Found ${MOCK_DISCOVERY.length} candidate repos`)
    }, 1500)
  }

  const stop = () => {
    setRunning(false)
    setStatus("idle")
  }

  const toggle = (key: string) => {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelected(next)
  }

  const addSelected = (repoName: string, count: number) => {
    if (count === 0) {
      toast.warning("Select at least one file")
      return
    }
    toast.success(`Added ${count} files from ${repoName}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Discover</h2>
        <p className="text-sm text-muted-foreground">
          Auto-find new proxy list repositories on GitHub.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <Label className="text-xs">Search queries</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {queries.map((q) => (
                <Badge
                  key={q}
                  variant="secondary"
                  className="cursor-pointer gap-1"
                  onClick={() => removeQuery(q)}
                >
                  {q}
                  <span className="text-muted-foreground hover:text-destructive">×</span>
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addQuery()}
                  placeholder="add query…"
                  className="h-7 w-32 text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={addQuery}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">Max results / query</Label>
              <Input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="h-9 mt-1"
              />
            </div>
            <div className="sm:col-span-2 flex items-end gap-2">
              {!running ? (
                <Button onClick={start}>
                  <Play className="mr-2 h-4 w-4" /> Start discovery
                </Button>
              ) : (
                <Button variant="outline" onClick={stop}>
                  <Square className="mr-2 h-4 w-4" /> Stop
                </Button>
              )}
              <Button variant="outline">
                <Wand2 className="mr-2 h-4 w-4" /> Suggest queries
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {running && (
        <Card>
          <CardContent className="space-y-2 p-4 font-mono text-xs">
            {queries.map((q, i) => (
              <div key={q} className="flex items-center gap-2 text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Searching: <span className="text-foreground">"{q}"</span>
                <span className="ml-auto">
                  {i < 2 ? `found ${30 - i * 8} repos` : "scanning…"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!hasResults && !running ? (
        <EmptyState
          icon={Search}
          title="No discovery results yet"
          description="Run a discovery scan to find new proxy list repositories on GitHub."
          actions={
            <Button onClick={start}>
              <Play className="mr-2 h-4 w-4" /> Start discovery
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {MOCK_DISCOVERY.map((repo) => {
            const repoSelected = repo.files.filter((f) => selected.has(`${repo.id}/${f.path}`)).length
            return (
              <Card key={repo.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-start justify-between gap-2 text-base">
                    <span className="flex items-center gap-2 font-mono text-sm">
                      <Github className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {repo.fullName}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" /> {repo.stars.toLocaleString()}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{repo.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    updated {repo.updatedAt}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {repo.files.map((f) => {
                    const key = `${repo.id}/${f.path}`
                    return (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selected.has(key)}
                          onCheckedChange={() => toggle(key)}
                        />
                        <span className="font-mono text-xs">{f.path}</span>
                        <Badge variant="outline" className="ml-auto h-5 px-1.5 text-[10px]">
                          {f.type}
                        </Badge>
                        <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">
                          {f.size}
                        </span>
                      </label>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => addSelected(repo.fullName, repoSelected)}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Add selected ({repoSelected})
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
