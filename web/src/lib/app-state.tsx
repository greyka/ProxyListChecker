import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { AppStatus } from "@/types"

interface AppStateValue {
  status: AppStatus
  setStatus: (s: AppStatus) => void
  search: string
  setSearch: (s: string) => void
}

const Ctx = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AppStatus>("idle")
  const [search, setSearch] = useState("")
  const value = useMemo(() => ({ status, setStatus, search, setSearch }), [status, search])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppState() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useAppState outside provider")
  return v
}
