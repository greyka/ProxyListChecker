import { Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { Background } from "./Background"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // Force dark-mode-first for premium pass
  useEffect(() => {
    const root = document.documentElement
    if (!root.classList.contains("dark") && !root.classList.contains("matrix")) {
      root.classList.add("dark")
    }
  }, [])

  return (
    <div className="relative flex min-h-screen w-full text-foreground">
      <Background />

      <div className="hidden lg:block sticky top-0 h-screen p-3">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 border-r-0 bg-transparent">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onBurger={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 pb-8 pt-2 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
