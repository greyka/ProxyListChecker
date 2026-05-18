import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Rss,
  Table2,
  Search,
  Settings,
  ScrollText,
  Shield,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2 border-b px-4 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Shield className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="flex min-w-0 flex-1 items-center justify-between">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">
                ProxyListChecker
              </div>
              <Badge variant="secondary" className="mt-0.5 h-5 px-1.5 text-[10px]">
                v0.3.0
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
                collapsed && "justify-center px-0",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        {collapsed ? (
          <div className="grid h-9 w-9 mx-auto place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
            <Shield className="h-4 w-4" />
          </div>
        ) : (
          <div className="rounded-md bg-sidebar-accent/60 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Your IP
            </div>
            <div className="font-mono text-xs">{STATS.yourIp}</div>
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-500">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {STATS.yourAnonymity} test
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
