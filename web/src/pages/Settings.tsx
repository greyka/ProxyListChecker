import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "@/lib/theme"
import { Sun, Moon, Monitor, Save, FolderGit2 as Github } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const TEST_URL_PRESETS = [
  "https://api.ipify.org",
  "https://httpbin.org/ip",
  "https://www.cloudflare.com/cdn-cgi/trace",
]

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [testUrl, setTestUrl] = useState("https://api.ipify.org")
  const [timeout, setTimeout_] = useState(5000)
  const [threads, setThreads] = useState(100)
  const [anonCheck, setAnonCheck] = useState(true)
  const [defaultShuffle, setDefaultShuffle] = useState(false)
  const [dedupe, setDedupe] = useState("strict")
  const [token, setToken] = useState("")
  const [connLimit, setConnLimit] = useState(500)
  const [retries, setRetries] = useState(2)
  const [dnsViaProxy, setDnsViaProxy] = useState(false)

  const save = () => toast.success("Settings saved")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Validation, sources, UI and network defaults.
          </p>
        </div>
        <Button onClick={save}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>

      <Tabs defaultValue="validation">
        <TabsList>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="ui">UI / Theme</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Validation defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Test URL</Label>
                <Input
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className="mt-1 font-mono text-xs"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TEST_URL_PRESETS.map((url) => (
                    <Badge
                      key={url}
                      variant={testUrl === url ? "default" : "outline"}
                      className="cursor-pointer font-mono text-[10px]"
                      onClick={() => setTestUrl(url)}
                    >
                      {url.replace(/^https?:\/\//, "")}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={timeout}
                    onChange={(e) => setTimeout_(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Threads</Label>
                  <Input
                    type="number"
                    value={threads}
                    onChange={(e) => setThreads(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">Detect anonymity level</div>
                  <p className="text-xs text-muted-foreground">
                    Classify each working proxy as transparent / anonymous / elite by inspecting
                    headers echoed back.
                  </p>
                </div>
                <Switch checked={anonCheck} onCheckedChange={setAnonCheck} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sources & ingestion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">Shuffle sources by default</div>
                  <p className="text-xs text-muted-foreground">
                    Randomize fetch order to spread load across mirror repos.
                  </p>
                </div>
                <Switch checked={defaultShuffle} onCheckedChange={setDefaultShuffle} />
              </div>
              <div>
                <Label>Dedupe strategy</Label>
                <Select value={dedupe} onValueChange={setDedupe}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict (host:port:type)</SelectItem>
                    <SelectItem value="host-port">Host:port (any type)</SelectItem>
                    <SelectItem value="none">None — keep duplicates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5" /> GitHub token
                </Label>
                <Input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_••••••••••••••••••••••••"
                  className="mt-1 font-mono"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Without a token GitHub limits you to 60 requests/hour. With a token: 5000/hour.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "matrix", label: "Matrix", icon: Monitor },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      theme === opt.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{opt.label}</span>
                      <opt.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div
                      className={cn(
                        "mt-3 grid grid-cols-3 gap-1 rounded-md p-2",
                        opt.id === "light" && "bg-white",
                        opt.id === "dark" && "bg-slate-900",
                        opt.id === "matrix" && "bg-black",
                      )}
                    >
                      <span
                        className={cn(
                          "h-6 rounded-sm",
                          opt.id === "light" && "bg-slate-200",
                          opt.id === "dark" && "bg-slate-700",
                          opt.id === "matrix" && "bg-green-900/70",
                        )}
                      />
                      <span
                        className={cn(
                          "h-6 rounded-sm",
                          opt.id === "light" && "bg-slate-100",
                          opt.id === "dark" && "bg-slate-800",
                          opt.id === "matrix" && "bg-green-700/40",
                        )}
                      />
                      <span
                        className={cn(
                          "h-6 rounded-sm",
                          opt.id === "light" && "bg-slate-900",
                          opt.id === "dark" && "bg-slate-200",
                          opt.id === "matrix" && "bg-green-400",
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Max concurrent connections</Label>
                  <Input
                    type="number"
                    value={connLimit}
                    onChange={(e) => setConnLimit(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Retries on failure</Label>
                  <Input
                    type="number"
                    value={retries}
                    onChange={(e) => setRetries(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">Resolve DNS through proxy</div>
                  <p className="text-xs text-muted-foreground">
                    When off, the system resolver is used (faster but leaks hostnames).
                  </p>
                </div>
                <Switch checked={dnsViaProxy} onCheckedChange={setDnsViaProxy} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
