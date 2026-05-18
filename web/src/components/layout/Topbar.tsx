import { useLocation } from "react-router-dom"
import { Menu, Moon, Search, Sun, RefreshCw, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

interface TopbarProps {
  onBurger?: () => void
}

export function Topbar({ onBurger }: TopbarProps) {
  const loc = useLocation()
  const title = TITLES[loc.pathname] ?? "ProxyListChecker"
  const { theme, setTheme } = useTheme()
  const { status, search, setSearch } = useAppState()
  const [updateOpen, setUpdateOpen] = useState(false)

  const statusPill = (() => {
    switch (status) {
      case "validating":
        return (
          <Badge variant="secondary" className="gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            Validating…
          </Badge>
        )
      case "discovering":
        return (
          <Badge variant="secondary" className="gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
            </span>
            Discovering…
          </Badge>
        )
      case "collecting":
        return (
          <Badge variant="secondary" className="gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            Collecting…
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/60" />
            Idle
          </Badge>
        )
    }
  })()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onBurger}
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="hidden text-lg font-semibold tracking-tight sm:block">
        {title}
      </h1>

      <div className="relative ml-auto w-full max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search proxies, sources…"
          className="pl-8 pr-12"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="hidden md:inline-flex"
        onClick={() => {
          toast.message("Checking for updates…")
          setTimeout(() => setUpdateOpen(true), 700)
        }}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Check for updates
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Theme">
            {theme === "light" ? (
              <Sun className="h-4.5 w-4.5" />
            ) : theme === "matrix" ? (
              <Monitor className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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

      <div className="ml-1">{statusPill}</div>

      <UpdateDialog open={updateOpen} onOpenChange={setUpdateOpen} />
    </header>
  )
}
