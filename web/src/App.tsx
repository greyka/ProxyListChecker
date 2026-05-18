import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/lib/theme"
import { AppStateProvider } from "@/lib/app-state"
import { AppShell } from "@/components/layout/AppShell"
import Dashboard from "@/pages/Dashboard"
import Sources from "@/pages/Sources"
import Results from "@/pages/Results"
import Discover from "@/pages/Discover"
import Settings from "@/pages/Settings"
import Logs from "@/pages/Logs"
import ErrorPreview from "@/pages/ErrorPreview"

export default function App() {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <TooltipProvider delayDuration={200}>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sources" element={<Sources />} />
                <Route path="/results" element={<Results />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/error-preview" element={<ErrorPreview />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster richColors closeButton position="bottom-right" />
        </TooltipProvider>
      </AppStateProvider>
    </ThemeProvider>
  )
}
