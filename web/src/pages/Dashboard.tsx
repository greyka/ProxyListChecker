import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Activity,
  ArrowUpRight,
  Download,
  Globe,
  Network,
  Play,
  Save,
  Shield,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  STATS,
  TOP_COUNTRIES,
  TOP_SOURCES,
  TYPE_DISTRIBUTION,
} from "@/lib/mock-data"
import { toast } from "sonner"
import { useAppState } from "@/lib/app-state"

type ToneKey = "blue" | "emerald" | "violet" | "amber"

const TONE: Record<
  ToneKey,
  { grad: string; glow: string; ring: string; text: string }
> = {
  blue: {
    grad: "linear-gradient(135deg, hsl(217 91% 60%), hsl(187 95% 50%))",
    glow: "0 0 24px hsl(217 91% 60% / 0.5)",
    ring: "hsl(217 91% 60% / 0.35)",
    text: "text-gradient-blue",
  },
  emerald: {
    grad: "linear-gradient(135deg, hsl(152 78% 50%), hsl(187 95% 50%))",
    glow: "0 0 24px hsl(152 78% 50% / 0.45)",
    ring: "hsl(152 78% 50% / 0.35)",
    text: "text-gradient-emerald",
  },
  violet: {
    grad: "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))",
    glow: "0 0 24px hsl(270 91% 65% / 0.5)",
    ring: "hsl(270 91% 65% / 0.35)",
    text: "text-gradient-violet",
  },
  amber: {
    grad: "linear-gradient(135deg, hsl(38 92% 55%), hsl(350 89% 60%))",
    glow: "0 0 24px hsl(38 92% 55% / 0.45)",
    ring: "hsl(38 92% 55% / 0.35)",
    text: "text-gradient-amber",
  },
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
  delta,
  index,
}: {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  tone: ToneKey
  delta?: string
  index: number
}) {
  const t = TONE[tone]
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="glass-panel glass-panel-hover relative overflow-hidden p-5"
    >
      {/* corner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl opacity-40"
        style={{ background: t.grad }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="section-label">{label}</div>
          <div className={`text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums ${t.text}`}>
            {value}
          </div>
          {sub && (
            <div className="pt-1.5 text-[11px] text-zinc-500">{sub}</div>
          )}
        </div>
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white"
          style={{
            background: t.grad,
            boxShadow: `${t.glow}, inset 0 1px 0 hsl(0 0% 100% / 0.18)`,
          }}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>
      </div>
      {delta && (
        <div className="mt-3 inline-flex h-5 items-center gap-1 rounded-full bg-emerald-500/10 px-2 text-[11px] font-medium text-emerald-400">
          <ArrowUpRight className="h-3 w-3" /> {delta}
        </div>
      )}
    </motion.div>
  )
}

const CHART_COLORS = [
  "hsl(217 91% 60%)",
  "hsl(187 95% 50%)",
  "hsl(270 91% 65%)",
  "hsl(152 78% 50%)",
  "hsl(38 92% 55%)",
  "hsl(350 89% 60%)",
]

function ChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel border-white/10 px-3 py-2 text-[12px]">
      {payload.map((p) => (
        <div key={p.name ?? p.dataKey} className="flex items-center gap-2 text-zinc-200">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: p.color ?? p.fill }}
          />
          <span className="text-zinc-400">{p.name ?? p.payload?.name}</span>
          <span className="font-mono tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
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
    toast.success("Saved valid_proxies.txt + by_type/")
  }

  const maxCountry = Math.max(...TOP_COUNTRIES.map((c) => c.count))

  const typeData = TYPE_DISTRIBUTION.map((d, i) => ({
    ...d,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="section-label">Overview</div>
          <h2 className="mt-1 text-[28px] font-semibold leading-none tracking-[-0.02em] text-white">
            Mission Control
          </h2>
          <p className="mt-2 text-[13px] text-zinc-400">
            Latest validation run · {STATS.fetched.toLocaleString()} proxies in the pool
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="glass" onClick={handleCollect}>
            <Download className="h-4 w-4" /> Collect
          </Button>
          <Button variant="accent" onClick={handleValidate}>
            <Play className="h-4 w-4" /> Validate
          </Button>
          <Button variant="glass" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save valid
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Network}
          label="Fetched proxies"
          value={fmt(STATS.fetched)}
          sub="from 13 enabled sources"
          tone="blue"
          delta="+12.4%"
          index={0}
        />
        <StatCard
          icon={Activity}
          label="Working"
          value={fmt(STATS.working)}
          sub={`${STATS.workingPct}% pass rate`}
          tone="emerald"
          delta="+3.1%"
          index={1}
        />
        <StatCard
          icon={Shield}
          label="Anonymous"
          value={fmt(STATS.anonymous)}
          sub={`${STATS.anonymousPct}% of working`}
          tone="violet"
          index={2}
        />
        <StatCard
          icon={Timer}
          label="Avg latency"
          value={`${STATS.avgLatency} ms`}
          sub="across OK proxies"
          tone="amber"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="section-label">Distribution</div>
              <div className="mt-1 flex items-center gap-2 text-[15px] font-semibold text-white">
                <Activity className="h-4 w-4 text-zinc-400" />
                Proxy types
              </div>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {CHART_COLORS.map((c, i) => (
                    <radialGradient key={i} id={`pie-grad-${i}`} cx="50%" cy="50%" r="80%">
                      <stop offset="0%" stopColor={c} stopOpacity={0.95} />
                      <stop offset="100%" stopColor={c} stopOpacity={0.7} />
                    </radialGradient>
                  ))}
                </defs>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={100}
                  paddingAngle={3}
                  stroke="hsl(220 24% 4%)"
                  strokeWidth={2}
                  animationDuration={900}
                >
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={`url(#pie-grad-${i})`} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {typeData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-[12px] text-zinc-400">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: CHART_COLORS[i],
                    boxShadow: `0 0 8px ${CHART_COLORS[i]}80`,
                  }}
                />
                <span className="text-zinc-300">{d.name}</span>
                <span className="ml-auto font-mono tabular-nums text-zinc-500">
                  {d.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="section-label">Performance</div>
              <div className="mt-1 flex items-center gap-2 text-[15px] font-semibold text-white">
                <TrendingUp className="h-4 w-4 text-zinc-400" />
                Top sources by yield
              </div>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={TOP_SOURCES.map((s) => ({ name: s.repo.split("/").pop(), yield: s.yield, working: s.working }))}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="bar-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(187 95% 50%)" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fill: "hsl(240 4% 55%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: "hsl(0 0% 100% / 0.04)" }} content={<ChartTooltip />} />
                <Bar
                  dataKey="yield"
                  fill="url(#bar-grad)"
                  radius={[6, 6, 6, 6]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="section-label">Geography</div>
            <div className="mt-1 flex items-center gap-2 text-[15px] font-semibold text-white">
              <Globe className="h-4 w-4 text-zinc-400" />
              Exit countries
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
          {TOP_COUNTRIES.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3"
            >
              <span className="inline-flex h-6 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-[10px] tracking-wider text-zinc-300">
                {c.code}
              </span>
              <span className="w-40 truncate text-[13px] text-zinc-200">{c.country}</span>
              <div className="flex-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.count / maxCountry) * 100}%` }}
                    transition={{ delay: i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, hsl(217 91% 60%), hsl(187 95% 50%))",
                      boxShadow: "0 0 10px hsl(217 91% 60% / 0.4)",
                    }}
                  />
                </div>
              </div>
              <span className="w-12 text-right font-mono text-[11px] tabular-nums text-zinc-400">
                {c.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
