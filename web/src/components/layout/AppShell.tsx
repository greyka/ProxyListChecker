import { Outlet } from "react-router-dom"
import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { Sheet, SheetContent } from "@/components/ui/sheet"

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <div className="hidden lg:block sticky top-0 h-screen">
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onBurger={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
