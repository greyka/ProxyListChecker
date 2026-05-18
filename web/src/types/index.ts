export type ProxyType = "HTTP" | "HTTPS" | "SOCKS4" | "SOCKS5"
export type ProxyStatus = "OK" | "FAIL" | "UNTESTED"
export type AnonymityLevel = "transparent" | "anonymous" | "elite" | "unknown"

export interface Proxy {
  id: string
  type: ProxyType
  status: ProxyStatus
  latency: number | null
  host: string
  port: number
  exitIp: string | null
  anonymity: AnonymityLevel
  source: string
  username?: string
  password?: string
}

export interface SourceUrl {
  id: string
  url: string
  detectedType: ProxyType | "MIXED" | "AUTO"
  lastFetch: "ok" | "404" | "timeout" | "pending"
  count: number
  enabled: boolean
}

export interface DiscoveryRepoFile {
  path: string
  type: ProxyType | "MIXED"
  size: string
}

export interface DiscoveryRepo {
  id: string
  fullName: string
  stars: number
  updatedAt: string
  description: string
  files: DiscoveryRepoFile[]
}

export type LogLevel = "info" | "warn" | "error" | "network" | "discovery"

export interface LogEntry {
  id: string
  ts: string
  level: LogLevel
  message: string
}

export type AppStatus = "idle" | "validating" | "discovering" | "collecting"
export type ThemeName = "light" | "dark" | "matrix"
