import { useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Bell, Menu, Moon, Search, Sun, Sparkles, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme"
import { useAppState } from "@/lib/app-state"
import { useState } from "react"
import { toast } from "sonner"
import { UpdateDialog } from "@/components/UpdateDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/sources": "Sources",
  "/results": "Results",
  "/discover": "Discover",
  "/settings": "Settings",
  "/logs": "Logs",
  "/error-preview": "Error",
}

const CRUMBS: Record<string, string> = {
  "/": "Overview",
  "/sources": "Configuration",
  "/results": "Validation",
  "/discover": "GitHub",
  "/settings": "Preferences",
  "/logs": "Diagnostics",
  "/error-preview": "Preview",
}

interface TopbarProps {
  onBurger?: () => void
}

export function Topbar({ onBurger }: TopbarProps) {
  const loc = useLocation()
  const title = TITLES[loc.pathname] ?? "ProxyListChecker"
  const crumb = CRUMBS[loc.pathname] ?? "App"
  const { theme, setTheme } = useTheme()
  const { status, search, setSearch } = useAppState()
  const [updateOpen, setUpdateOpen] = useState(false)

  const statusPill = (() => {
    const map = {
      validating: { label: "Validating", color: "59 130 246", dotColor: "#3B82F6" },
      discovering: { label: "Discovering", color: "168 85 247", dotColor: "#A855F7" },
      collecting: { label: "Collecting", color: "245 158 11", dotColor: "#F59E0B" },
      idle: { label: "Idle", color: "120 120 130", dotColor: "#888" },
    } as const
    const cfg = map[status as keyof typeof map] ?? map.idle
    const isActive = status !== "idle"
    return (
      <div
        className="inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[11px] font-medium tracking-wide"
        style={{
          borderColor: isActive ? `rgb(${cfg.color} / 0.4)` : "hsl(0 0% 100% / 0.08)",
          background: isActive ? `rgb(${cfg.color} / 0.08)` : "hsl(0 0% 100% / 0.03)",
          color: isActive ? `rgb(${cfg.color})` : "hsl(240 5% 65%)",
          boxShadow: isActive ? `0 0 18px rgb(${cfg.color} / 0.25)` : undefined,
        }}
      >
        <span className="relative inline-flex h-1.5 w-1.5">
          {isActive && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: cfg.dotColor }}
            />
          )}
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isActive ? "breathing" : ""}`}
            style={{ background: cfg.dotColor }}
          />
        </span>
        <span>{cfg.label}{isActive ? "…" : ""}</span>
      </div>
    )
  })()

  return (
    <div className="sticky top-0 z-30 px-3 pt-3 pb-2 sm:px-4 lg:px-6">
      <header className="glass-panel flex h-[60px] items-center gap-3 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 rounded-lg text-zinc-300 hover:bg-white/[0.06]"
          onClick={onBurger}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden flex-col sm:flex">
          <div className="section-label leading-none">{crumb}</div>
          <h1 className="mt-1 text-[20px] font-semibold leading-none tracking-[-0.02em] text-white">
            {title}
          </h1>
        </div>

        <div className="relative ml-auto hidden w-full max-w-md md:block">
          <div className="glass-input flex h-10 items-center gap-2 px-3">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search proxies, sources, repos…"
              className="flex-1 bg-transparent text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            <kbd className="hidden select-none rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline-block">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {statusPill}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              toast.message("Checking for updates…")
              setTimeout(() => setUpdateOpen(true), 700)
            }}
            className="group relative hidden h-9 items-center gap-1.5 rounded-xl px-3 text-[12px] font-medium text-white md:inline-flex"
            style={{
              background: "linear-gradient(135deg, hsl(217 91% 58%), hsl(217 91% 48%))",
              boxShadow:
                "0 0 24px hsl(217 91% 60% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.18)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Updates
          </motion.button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative h-9 w-9 rounded-xl text-zinc-300 hover:bg-white/[0.06]"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgb(244_63_94_/0.7)]" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Theme"
                className="h-9 w-9 rounded-xl text-zinc-300 hover:bg-white/[0.06]"
              >
                {theme === "light" ? (
                  <Sun className="h-4.5 w-4.5" />
                ) : theme === "matrix" ? (
                  <Monitor className="h-4.5 w-4.5" />
                ) : (
                  <Moon className="h-4.5 w-4.5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-panel border-white/10">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("matrix")}>
                <Monitor className="mr-2 h-4 w-4" /> Matrix
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar */}
          <div
            className="ml-1 grid h-9 w-9 place-items-center rounded-full text-[11px] font-semibold text-white"
            style={{
              background:
                "linear-gradient(135deg, hsl(270 91% 65%), hsl(217 91% 60%))",
              boxShadow:
                "0 0 0 1.5px hsl(0 0% 100% / 0.1), 0 0 18px hsl(270 91% 65% / 0.4)",
            }}
            aria-label="Profile"
          >
            PL
          </div>
        </div>

        <UpdateDialog open={updateOpen} onOpenChange={setUpdateOpen} />
      </header>
    </div>
  )
}
