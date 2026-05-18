using System.Text.Json;
using System.Text.RegularExpressions;

namespace ProxyListChecker.Services;

/// <summary>
/// Автопоиск новых источников прокси через GitHub API.
/// 1. Search repos: запросы "proxy list", "free proxy", "socks5 list", сортировка по updated.
/// 2. Для каждого репо берём git tree → ищем файлы вида http*.txt, socks*.txt, proxy*.txt.
/// 3. Возвращаем raw URL'ы, которых ещё нет в текущем списке.
/// </summary>
public sealed class SourceDiscovery
{
    private static readonly string[] Queries =
    {
        "proxy-list in:name,description sort:updated",
        "free-proxy in:name,description sort:updated",
        "socks5 proxy list in:name,description sort:updated",
        "proxy scraper in:name,description sort:updated",
        "proxy checker in:name,description sort:updated",
    };

    private static readonly Regex FileRx = new(
        @"^(?:.*/)?(?:proxies?|http|https|socks4a?|socks5h?|all)(?:[-_]?(?:list|checked|free|raw|alive|good|valid|anonymous|elite))?\.txt$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private readonly HttpClient _http;

    public SourceDiscovery()
    {
        _http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("ProxyListChecker-SourceDiscovery");
        _http.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
        var token = Environment.GetEnvironmentVariable("GITHUB_TOKEN");
        if (!string.IsNullOrEmpty(token))
            _http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<List<string>> DiscoverAsync(
        ISet<string> existing,
        int maxRepos,
        int maxNew,
        Action<string> log,
        CancellationToken ct)
    {
        var found = new List<string>();
        var seenRepos = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var q in Queries)
        {
            if (ct.IsCancellationRequested || found.Count >= maxNew) break;
            log($"  search: {q}");
            List<(string FullName, string DefaultBranch, int Stars)> repos;
            try { repos = await SearchReposAsync(q, maxRepos, ct); }
            catch (Exception ex) { log("  ! search error: " + ex.Message); continue; }
            log($"    нашёл репо: {repos.Count}");

            foreach (var (fullName, branch, stars) in repos)
            {
                if (ct.IsCancellationRequested || found.Count >= maxNew) break;
                if (!seenRepos.Add(fullName)) continue;
                try
                {
                    var rawUrls = await ProbeRepoAsync(fullName, branch, ct);
                    int added = 0;
                    foreach (var url in rawUrls)
                    {
                        if (existing.Contains(url)) continue;
                        if (found.Contains(url)) continue;
                        found.Add(url);
                        added++;
                        if (found.Count >= maxNew) break;
                    }
                    if (added > 0) log($"    + {fullName} (★{stars}) → {added} url");
                }
                catch (Exception ex)
                {
                    log($"    ! {fullName}: {ex.Message}");
                }
                // лёгкий троттлинг чтобы не упереться в rate limit
                await Task.Delay(120, ct);
            }
        }

        return found;
    }

    private async Task<List<(string FullName, string DefaultBranch, int Stars)>> SearchReposAsync(string query, int perPage, CancellationToken ct)
    {
        var url = $"https://api.github.com/search/repositories?q={Uri.EscapeDataString(query)}&per_page={perPage}";
        var json = await _http.GetStringAsync(url, ct);
        using var doc = JsonDocument.Parse(json);
        var list = new List<(string, string, int)>();
        if (!doc.RootElement.TryGetProperty("items", out var items)) return list;
        foreach (var item in items.EnumerateArray())
        {
            var name = item.GetProperty("full_name").GetString() ?? "";
            var branch = item.TryGetProperty("default_branch", out var b) ? b.GetString() ?? "main" : "main";
            var stars = item.TryGetProperty("stargazers_count", out var s) ? s.GetInt32() : 0;
            if (!string.IsNullOrEmpty(name)) list.Add((name, branch, stars));
        }
        return list;
    }

    private async Task<List<string>> ProbeRepoAsync(string fullName, string branch, CancellationToken ct)
    {
        // git tree
        var url = $"https://api.github.com/repos/{fullName}/git/trees/{branch}?recursive=1";
        var json = await _http.GetStringAsync(url, ct);
        using var doc = JsonDocument.Parse(json);
        var result = new List<string>();
        if (!doc.RootElement.TryGetProperty("tree", out var tree)) return result;
        foreach (var node in tree.EnumerateArray())
        {
            if (node.GetProperty("type").GetString() != "blob") continue;
            var path = node.GetProperty("path").GetString() ?? "";
            if (path.Length > 200) continue;
            // фильтр: имя файла из FileRx, плюс не в node_modules/test/example
            if (path.Contains("/test/", StringComparison.OrdinalIgnoreCase)) continue;
            if (path.Contains("/example", StringComparison.OrdinalIgnoreCase)) continue;
            if (path.Contains("node_modules", StringComparison.OrdinalIgnoreCase)) continue;
            if (path.Contains(".git/", StringComparison.OrdinalIgnoreCase)) continue;
            if (!FileRx.IsMatch(path)) continue;
            // размер: пропускаем явно мелочь и гигантские (>5MB)
            if (node.TryGetProperty("size", out var sizeEl))
            {
                int sz = sizeEl.GetInt32();
                if (sz < 50 || sz > 5_000_000) continue;
            }
            result.Add($"https://raw.githubusercontent.com/{fullName}/{branch}/{path}");
        }
        return result;
    }
}
