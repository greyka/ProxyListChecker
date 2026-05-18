import { NavLink, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Rss,
  Table2,
  Search,
  Settings,
  ScrollText,
  Shield,
  ChevronLeft,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { STATS } from "@/lib/mock-data"

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/sources", label: "Sources", icon: Rss },
  { to: "/results", label: "Results", icon: Table2 },
  { to: "/discover", label: "Discover", icon: Search },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/logs", label: "Logs", icon: ScrollText },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}

export function Sidebar({ collapsed, onToggleCollapse, onNavigate }: SidebarProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        "glass-panel flex h-[calc(100vh-24px)] flex-col overflow-hidden transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="relative shrink-0">
          <div
            className="grid h-9 w-9 place-items-center rounded-xl text-white"
            style={{
              background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(187 95% 50%))",
              boxShadow:
                "0 0 24px hsl(217 91% 60% / 0.55), inset 0 1px 0 hsl(0 0% 100% / 0.2)",
            }}
          >
            <Shield className="h-4.5 w-4.5" strokeWidth={2.2} />
          </div>
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 items-center justify-between">
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold tracking-tight text-gradient-blue">
                ProxyListChecker
              </div>
              <div className="mt-0.5 inline-flex h-4 items-center rounded-full border border-white/10 bg-white/[0.04] px-1.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                v0.3.0
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 rounded-lg text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="divider" />

      {/* Nav */}
      <nav className="relative flex-1 space-y-1 px-2 py-3">
        {!collapsed && (
          <div className="px-3 pb-2 section-label">Workspace</div>
        )}
        {NAV.map(({ to, label, icon: Icon, end }) => {
          const isActive =
            end ? location.pathname === to : location.pathname.startsWith(to) && (to !== "/" || location.pathname === "/")
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors",
                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-100",
                collapsed && "justify-center px-0",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(217 91% 60% / 0.18), hsl(217 91% 60% / 0.08))",
                    border: "1px solid hsl(217 91% 60% / 0.35)",
                    boxShadow:
                      "0 0 24px hsl(217 91% 60% / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.08)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid h-7 w-7 place-items-center rounded-lg transition-colors",
                  isActive
                    ? "text-white"
                    : "text-zinc-400 group-hover:text-zinc-100",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.75} />
              </span>
              {!collapsed && <span className="relative z-10 truncate">{label}</span>}
              {!collapsed && isActive && (
                <span
                  className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ background: "hsl(187 95% 50%)", boxShadow: "0 0 8px hsl(187 95% 50% / 0.8)" }}
                />
              )}
              {/* hover glass */}
              {!isActive && (
                <span className="absolute inset-0 rounded-xl bg-white/0 transition-colors group-hover:bg-white/[0.04]" />
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="divider" />

      {/* Footer */}
      <div className="p-3">
        {collapsed ? (
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 glow-emerald">
            <Activity className="h-4 w-4" />
          </div>
        ) : (
          <div className="glass-panel rounded-xl border-white/5 px-3 py-2.5">
            <div className="section-label">Your IP</div>
            <div className="mt-0.5 truncate font-mono text-[12px] text-zinc-200 tabular-nums">
              {STATS.yourIp}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {STATS.yourAnonymity} test
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
