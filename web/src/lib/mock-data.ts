import type {
  DiscoveryRepo,
  LogEntry,
  Proxy,
  SourceUrl,
} from "@/types"

export const STATS = {
  fetched: 87432,
  working: 1247,
  workingPct: 1.4,
  anonymous: 1089,
  anonymousPct: 87,
  avgLatency: 412,
  yourIp: "188.114.97.7",
  yourAnonymity: "anonymous" as const,
}

export const TYPE_DISTRIBUTION = [
  { name: "HTTP", value: 412, color: "#3b82f6" },
  { name: "HTTPS", value: 268, color: "#10b981" },
  { name: "SOCKS4", value: 197, color: "#f59e0b" },
  { name: "SOCKS5", value: 370, color: "#8b5cf6" },
]

export const TOP_SOURCES = [
  { repo: "monosans/proxy-list", yield: 4.2, working: 312 },
  { repo: "TheSpeedX/PROXY-List", yield: 2.1, working: 287 },
  { repo: "proxifly/free-proxy-list", yield: 1.8, working: 198 },
  { repo: "ShiftyTR/Proxy-List", yield: 1.5, working: 156 },
  { repo: "KangProxy/KangProxy", yield: 1.1, working: 142 },
]

export const TOP_COUNTRIES = [
  { country: "United States", code: "US", count: 287 },
  { country: "Germany", code: "DE", count: 198 },
  { country: "Russia", code: "RU", count: 156 },
  { country: "Brazil", code: "BR", count: 121 },
  { country: "Indonesia", code: "ID", count: 98 },
  { country: "India", code: "IN", count: 87 },
  { country: "France", code: "FR", count: 76 },
  { country: "United Kingdom", code: "GB", count: 68 },
  { country: "China", code: "CN", count: 64 },
  { country: "Canada", code: "CA", count: 52 },
]

export const MOCK_SOURCES: SourceUrl[] = [
  {
    id: "s1",
    url: "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
    detectedType: "HTTP",
    lastFetch: "ok",
    count: 13284,
    enabled: true,
  },
  {
    id: "s2",
    url: "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt",
    detectedType: "SOCKS4",
    lastFetch: "ok",
    count: 8421,
    enabled: true,
  },
  {
    id: "s3",
    url: "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt",
    detectedType: "SOCKS5",
    lastFetch: "ok",
    count: 4129,
    enabled: true,
  },
  {
    id: "s4",
    url: "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/all.txt",
    detectedType: "MIXED",
    lastFetch: "ok",
    count: 19842,
    enabled: true,
  },
  {
    id: "s5",
    url: "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt",
    detectedType: "HTTP",
    lastFetch: "ok",
    count: 7621,
    enabled: true,
  },
  {
    id: "s6",
    url: "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt",
    detectedType: "MIXED",
    lastFetch: "ok",
    count: 11203,
    enabled: true,
  },
  {
    id: "s7",
    url: "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt",
    detectedType: "HTTP",
    lastFetch: "404",
    count: 0,
    enabled: true,
  },
  {
    id: "s8",
    url: "https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/socks5.txt",
    detectedType: "SOCKS5",
    lastFetch: "404",
    count: 0,
    enabled: false,
  },
  {
    id: "s9",
    url: "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/http/http.txt",
    detectedType: "HTTP",
    lastFetch: "ok",
    count: 6210,
    enabled: true,
  },
  {
    id: "s10",
    url: "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks5/socks5.txt",
    detectedType: "SOCKS5",
    lastFetch: "ok",
    count: 2918,
    enabled: true,
  },
  {
    id: "s11",
    url: "https://api.proxyscrape.com/v3/free-proxy-list/get?request=getproxies&protocol=http",
    detectedType: "HTTP",
    lastFetch: "ok",
    count: 3814,
    enabled: true,
  },
  {
    id: "s12",
    url: "https://api.proxyscrape.com/v3/free-proxy-list/get?request=getproxies&protocol=socks4",
    detectedType: "SOCKS4",
    lastFetch: "timeout",
    count: 0,
    enabled: true,
  },
  {
    id: "s13",
    url: "https://www.proxy-list.download/api/v1/get?type=https",
    detectedType: "HTTPS",
    lastFetch: "ok",
    count: 2103,
    enabled: true,
  },
  {
    id: "s14",
    url: "https://raw.githubusercontent.com/zloi-user/hideip.me/main/https.txt",
    detectedType: "HTTPS",
    lastFetch: "ok",
    count: 1842,
    enabled: true,
  },
  {
    id: "s15",
    url: "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5_proxies.txt",
    detectedType: "SOCKS5",
    lastFetch: "ok",
    count: 1502,
    enabled: false,
  },
]

const sourceShort = (full: string) => {
  const m = full.match(/githubusercontent\.com\/([^/]+\/[^/]+)/)
  if (m) return m[1]
  try {
    return new URL(full).hostname
  } catch {
    return full
  }
}

const mk = (
  i: number,
  type: Proxy["type"],
  status: Proxy["status"],
  latency: number | null,
  host: string,
  port: number,
  exitIp: string | null,
  anonymity: Proxy["anonymity"],
  source: string,
): Proxy => ({
  id: `p${i}`,
  type,
  status,
  latency,
  host,
  port,
  exitIp,
  anonymity,
  source: sourceShort(source),
})

export const MOCK_PROXIES: Proxy[] = [
  mk(1, "HTTP", "OK", 187, "203.142.69.142", 8080, "203.142.69.142", "anonymous", "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt"),
  mk(2, "HTTPS", "OK", 312, "45.79.112.203", 443, "45.79.112.203", "elite", "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/all.txt"),
  mk(3, "SOCKS5", "OK", 421, "94.130.219.18", 1080, "94.130.219.18", "elite", "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt"),
  mk(4, "SOCKS4", "OK", 689, "188.166.36.4", 4145, "188.166.36.4", "anonymous", "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt"),
  mk(5, "HTTP", "FAIL", null, "172.104.43.81", 3128, null, "unknown", "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt"),
  mk(6, "HTTP", "OK", 248, "139.59.1.14", 8118, "139.59.1.14", "transparent", "https://api.proxyscrape.com/v3/free-proxy-list/get"),
  mk(7, "SOCKS5", "OK", 198, "178.62.193.19", 1080, "178.62.193.19", "elite", "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks5/socks5.txt"),
  mk(8, "HTTPS", "OK", 401, "159.69.57.20", 8443, "159.69.57.20", "anonymous", "https://www.proxy-list.download/api/v1/get?type=https"),
  mk(9, "HTTP", "FAIL", null, "82.165.184.53", 80, null, "unknown", "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt"),
  mk(10, "SOCKS5", "OK", 752, "23.95.221.45", 1080, "23.95.221.45", "elite", "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt"),
  mk(11, "SOCKS4", "FAIL", null, "51.158.106.54", 1080, null, "unknown", "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt"),
  mk(12, "HTTP", "OK", 134, "165.227.108.30", 8080, "165.227.108.30", "anonymous", "https://raw.githubusercontent.com/zloi-user/hideip.me/main/https.txt"),
  mk(13, "HTTPS", "OK", 287, "138.197.36.149", 443, "138.197.36.149", "transparent", "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/all.txt"),
  mk(14, "SOCKS5", "UNTESTED", null, "104.236.114.184", 1080, null, "unknown", "https://raw.githubusercontent.com/officialputuid/KangProxy/KangProxy/socks5/socks5.txt"),
  mk(15, "HTTP", "OK", 612, "212.85.122.211", 3128, "212.85.122.211", "elite", "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt"),
  mk(16, "SOCKS4", "OK", 893, "144.91.94.89", 4145, "144.91.94.89", "anonymous", "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt"),
  mk(17, "HTTP", "OK", 304, "194.5.193.183", 8080, "194.5.193.183", "transparent", "https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt"),
  mk(18, "SOCKS5", "OK", 156, "176.9.75.42", 1080, "176.9.75.42", "elite", "https://raw.githubusercontent.com/MuRongPIG/Proxy-Master/main/socks5_proxies.txt"),
]

export const MOCK_DISCOVERY: DiscoveryRepo[] = [
  {
    id: "d1",
    fullName: "TheSpeedX/PROXY-List",
    stars: 4823,
    updatedAt: "2 hours ago",
    description: "Free proxy list updated daily — HTTP/SOCKS4/SOCKS5",
    files: [
      { path: "http.txt", type: "HTTP", size: "412 KB" },
      { path: "socks4.txt", type: "SOCKS4", size: "287 KB" },
      { path: "socks5.txt", type: "SOCKS5", size: "138 KB" },
    ],
  },
  {
    id: "d2",
    fullName: "monosans/proxy-list",
    stars: 2104,
    updatedAt: "13 minutes ago",
    description: "Auto-checked proxy list (HTTP/HTTPS/SOCKS4/SOCKS5)",
    files: [
      { path: "proxies/all.txt", type: "MIXED", size: "1.2 MB" },
      { path: "proxies/http.txt", type: "HTTP", size: "318 KB" },
      { path: "proxies/socks4.txt", type: "SOCKS4", size: "194 KB" },
      { path: "proxies/socks5.txt", type: "SOCKS5", size: "92 KB" },
    ],
  },
  {
    id: "d3",
    fullName: "proxifly/free-proxy-list",
    stars: 1487,
    updatedAt: "5 minutes ago",
    description: "Free proxy lists curated by Proxifly",
    files: [
      { path: "proxies/all/data.txt", type: "MIXED", size: "892 KB" },
      { path: "proxies/protocols/http/data.txt", type: "HTTP", size: "284 KB" },
    ],
  },
  {
    id: "d4",
    fullName: "officialputuid/KangProxy",
    stars: 982,
    updatedAt: "1 hour ago",
    description: "Daily fresh proxies — KangProxy",
    files: [
      { path: "http/http.txt", type: "HTTP", size: "218 KB" },
      { path: "socks5/socks5.txt", type: "SOCKS5", size: "112 KB" },
    ],
  },
  {
    id: "d5",
    fullName: "MuRongPIG/Proxy-Master",
    stars: 612,
    updatedAt: "4 hours ago",
    description: "Master proxy list",
    files: [
      { path: "http_proxies.txt", type: "HTTP", size: "189 KB" },
      { path: "socks5_proxies.txt", type: "SOCKS5", size: "78 KB" },
    ],
  },
  {
    id: "d6",
    fullName: "zloi-user/hideip.me",
    stars: 421,
    updatedAt: "22 hours ago",
    description: "Cleaned HTTPS proxies",
    files: [
      { path: "https.txt", type: "HTTPS", size: "94 KB" },
      { path: "socks.txt", type: "MIXED", size: "67 KB" },
    ],
  },
]

const lvl = (level: LogEntry["level"]) => level

export const MOCK_LOGS: LogEntry[] = [
  { id: "l1", ts: "14:02:11", level: lvl("info"), message: "ProxyListChecker v0.3.0 started" },
  { id: "l2", ts: "14:02:11", level: lvl("info"), message: "Loaded 15 sources from sources.json" },
  { id: "l3", ts: "14:02:12", level: lvl("network"), message: "GET https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt -> 200 OK (13284 lines)" },
  { id: "l4", ts: "14:02:12", level: lvl("network"), message: "GET https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt -> 200 OK (8421 lines)" },
  { id: "l5", ts: "14:02:13", level: lvl("network"), message: "GET https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt -> 200 OK (4129 lines)" },
  { id: "l6", ts: "14:02:13", level: lvl("network"), message: "GET https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/all.txt -> 200 OK (19842 lines)" },
  { id: "l7", ts: "14:02:14", level: lvl("warn"), message: "Source https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt returned 404" },
  { id: "l8", ts: "14:02:15", level: lvl("info"), message: "Dedup: 87432 unique entries (12831 duplicates removed)" },
  { id: "l9", ts: "14:02:16", level: lvl("info"), message: "Starting validation: 100 threads, timeout 5000ms, test URL https://api.ipify.org" },
  { id: "l10", ts: "14:02:18", level: lvl("info"), message: "[1024/87432] checked — 17 OK, 9 anonymous" },
  { id: "l11", ts: "14:03:42", level: lvl("info"), message: "[12480/87432] checked — 198 OK, 173 anonymous" },
  { id: "l12", ts: "14:05:11", level: lvl("error"), message: "Connection refused 82.165.184.53:80" },
  { id: "l13", ts: "14:05:14", level: lvl("error"), message: "Timeout 51.158.106.54:1080 (5000ms)" },
  { id: "l14", ts: "14:08:01", level: lvl("info"), message: "[42100/87432] checked — 612 OK, 541 anonymous" },
  { id: "l15", ts: "14:11:23", level: lvl("warn"), message: "GitHub API rate limit hit — backing off 60s" },
  { id: "l16", ts: "14:12:25", level: lvl("discovery"), message: "Searching: \"proxy-list\" — found 30 repos" },
  { id: "l17", ts: "14:12:27", level: lvl("discovery"), message: "Searching: \"free-proxy\" — found 22 repos" },
  { id: "l18", ts: "14:12:30", level: lvl("discovery"), message: "Detected proxy file: proxies/all.txt in monosans/proxy-list" },
  { id: "l19", ts: "14:14:55", level: lvl("info"), message: "[71840/87432] checked — 1042 OK, 912 anonymous" },
  { id: "l20", ts: "14:16:00", level: lvl("info"), message: "Validation complete: 1247 OK / 87432 (1.4%) in 14m 23s" },
  { id: "l21", ts: "14:16:01", level: lvl("info"), message: "Anonymity classification: 158 transparent, 745 anonymous, 344 elite" },
  { id: "l22", ts: "14:16:02", level: lvl("info"), message: "Saved valid_proxies.txt (1247 entries)" },
  { id: "l23", ts: "14:16:02", level: lvl("info"), message: "Saved by_type/http.txt (412), by_type/https.txt (268), by_type/socks4.txt (197), by_type/socks5.txt (370)" },
  { id: "l24", ts: "14:18:34", level: lvl("network"), message: "Self-update check -> latest v0.3.0 (current v0.3.0)" },
  { id: "l25", ts: "14:22:01", level: lvl("discovery"), message: "Added 24 new sources from auto-discovery" },
  { id: "l26", ts: "14:25:18", level: lvl("info"), message: "Commented out 3 dead sources (404)" },
  { id: "l27", ts: "14:32:01", level: lvl("warn"), message: "Low yield from 5 sources — consider pruning" },
  { id: "l28", ts: "14:40:11", level: lvl("network"), message: "GET https://api.ipify.org via 203.142.69.142:8080 -> 200 (187ms)" },
  { id: "l29", ts: "14:40:12", level: lvl("info"), message: "Idle" },
  { id: "l30", ts: "14:55:48", level: lvl("info"), message: "User clicked Validate selected (24 proxies)" },
]
