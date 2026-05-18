using ProxyListChecker.Models;

namespace ProxyListChecker.Services;

/// <summary>
/// Парсит строку прокси в любом популярном формате.
/// Поддерживает: host:port, type://host:port, user:pass@host:port,
/// type://user:pass@host:port, host:port:user:pass, host;port;user;pass.
/// </summary>
public static class ProxyParser
{
    public static ProxyEntry? Parse(string raw, ProxyKind defaultKind = ProxyKind.Http, string? sourceUrl = null)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        raw = raw.Trim();
        if (raw.StartsWith("#") || raw.StartsWith("//")) return null;

        // 1. префикс схемы
        ProxyKind kind = defaultKind;
        int schemeEnd = raw.IndexOf("://", StringComparison.Ordinal);
        if (schemeEnd > 0)
        {
            var scheme = raw[..schemeEnd].ToLowerInvariant();
            kind = scheme switch
            {
                "http" => ProxyKind.Http,
                "https" => ProxyKind.Https,
                "socks4" or "socks4a" => ProxyKind.Socks4,
                "socks5" or "socks5h" => ProxyKind.Socks5,
                _ => defaultKind,
            };
            raw = raw[(schemeEnd + 3)..];
        }

        string? user = null, pass = null;

        // 2. user:pass@host:port
        int atIdx = raw.LastIndexOf('@');
        if (atIdx > 0)
        {
            var auth = raw[..atIdx];
            raw = raw[(atIdx + 1)..];
            int colon = auth.IndexOf(':');
            if (colon > 0) { user = auth[..colon]; pass = auth[(colon + 1)..]; }
            else user = auth;
        }

        // 3. отрезать query/path/fragment, если кто-то приложил
        foreach (var sep in new[] { '?', '#', '/' })
        {
            int p = raw.IndexOf(sep);
            if (p > 0) raw = raw[..p];
        }

        // 4. host:port или host:port:user:pass или host;port[;user;pass]
        string[] parts;
        if (raw.Contains(';')) parts = raw.Split(';', StringSplitOptions.RemoveEmptyEntries);
        else if (raw.Count(c => c == ':') >= 3) parts = raw.Split(':', StringSplitOptions.RemoveEmptyEntries);
        else parts = raw.Split(':', StringSplitOptions.RemoveEmptyEntries);

        if (parts.Length < 2) return null;

        string host = parts[0].Trim();
        if (!int.TryParse(parts[1].Trim(), out int port) || port <= 0 || port > 65535) return null;

        if (parts.Length >= 4 && user == null)
        {
            user = parts[2].Trim();
            pass = parts[3].Trim();
        }

        if (string.IsNullOrWhiteSpace(host)) return null;

        return new ProxyEntry
        {
            Kind = kind == ProxyKind.Unknown ? ProxyKind.Http : kind,
            Host = host,
            Port = port,
            User = string.IsNullOrEmpty(user) ? null : user,
            Password = pass,
            Source = sourceUrl,
        };
    }

    /// <summary>Угадывает тип прокси из URL источника (по имени файла).</summary>
    public static ProxyKind GuessKindFromUrl(string url)
    {
        var u = url.ToLowerInvariant();
        if (u.Contains("socks5")) return ProxyKind.Socks5;
        if (u.Contains("socks4")) return ProxyKind.Socks4;
        if (u.Contains("https")) return ProxyKind.Https;
        if (u.Contains("http")) return ProxyKind.Http;
        return ProxyKind.Http;
    }
}
