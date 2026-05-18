import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Download,
  Globe,
  Network,
  Play,
  Save,
  Shield,
  Timer,
  TrendingUp,
} from "lucide-react"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  STATS,
  TOP_COUNTRIES,
  TOP_SOURCES,
  TYPE_DISTRIBUTION,
} from "@/lib/mock-data"
import { toast } from "sonner"
import { useAppState } from "@/lib/app-state"

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Activity
  label: string
  value: string
  sub?: string
  tone?: "default" | "success" | "info" | "warn"
}) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-500/10 text-emerald-500"
      : tone === "info"
      ? "bg-blue-500/10 text-blue-500"
      : tone === "warn"
      ? "bg-amber-500/10 text-amber-500"
      : "bg-muted text-foreground"
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { setStatus } = useAppState()
  const fmt = (n: number) => n.toLocaleString("en-US")

  const handleCollect = () => {
    setStatus("collecting")
    toast.message("Collecting from 13 enabled sources…")
    setTimeout(() => {
      setStatus("idle")
      toast.success("Collected 87,432 proxies", {
        description: "Deduplicated from 12,831 duplicates.",
      })
    }, 1800)
  }

  const handleValidate = () => {
    setStatus("validating")
    toast.message("Validation started — 100 threads")
    setTimeout(() => {
      setStatus("idle")
      toast.success("Validation complete: 1,247 OK / 87,432 total in 14m 23s")
    }, 2400)
  }

  const handleSave = () => {
    toast.success("Saved valid_proxies.txt + by_type/", {
      action: { label: "Open folder", onClick: () => {} },
    })
  }

  const maxCountry = Math.max(...TOP_COUNTRIES.map((c) => c.count))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of the latest validation run.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCollect}>
            <Download className="mr-2 h-4 w-4" /> Collect
          </Button>
          <Button onClick={handleValidate}>
            <Play className="mr-2 h-4 w-4" /> Validate
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save valid
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Network}
          label="Fetched proxies"
          value={fmt(STATS.fetched)}
          sub="from 13 enabled sources"
        />
        <StatCard
          icon={Activity}
          label="Working"
          value={fmt(STATS.working)}
          sub={`${STATS.workingPct}% pass rate`}
          tone="success"
        />
        <StatCard
          icon={Shield}
          label="Anonymous"
          value={fmt(STATS.anonymous)}
          sub={`${STATS.anonymousPct}% of working`}
          tone="info"
        />
        <StatCard
          icon={Timer}
          label="Avg latency"
          value={`${STATS.avgLatency} ms`}
          sub="across OK proxies"
          tone="warn"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Proxy types
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TYPE_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke="var(--background)"
                >
                  {TYPE_DISTRIBUTION.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Top sources by yield
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TOP_SOURCES.map((s) => (
              <div key={s.repo} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs">{s.repo}</span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{s.yield}%</span>{" "}
                    · {s.working} OK
                  </span>
                </div>
                <Progress value={(s.yield / 5) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Exit geography
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
            {TOP_COUNTRIES.map((c) => (
              <div key={c.code} className="flex items-center gap-3">
                <span className="inline-flex h-6 w-9 items-center justify-center rounded border bg-muted/40 font-mono text-[10px] tracking-wider text-muted-foreground">
                  {c.code}
                </span>
                <span className="w-44 truncate text-sm">{c.country}</span>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.count / maxCountry) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 text-right font-mono text-xs text-muted-foreground">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
