using System.Net;
using ProxyListChecker.Models;

namespace ProxyListChecker.Services;

public sealed class SourceFetcher
{
    private readonly HttpClient _http;

    public SourceFetcher()
    {
        var handler = new HttpClientHandler { AutomaticDecompression = DecompressionMethods.All };
        _http = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(30) };
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 ProxyListChecker/1.0");
    }

    public async Task<List<ProxyEntry>> FetchAllAsync(IEnumerable<string> urls, Action<string> log, CancellationToken ct)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var result = new List<ProxyEntry>();
        foreach (var url in urls)
        {
            // Прерывание — НЕ кидаем исключение, возвращаем то что уже собрали
            if (ct.IsCancellationRequested) { log("Остановлено пользователем — сохраняю частичный результат."); break; }
            try
            {
                log($"GET {url}");
                var body = await _http.GetStringAsync(url, ct);
                var defaultKind = ProxyParser.GuessKindFromUrl(url);
                int added = 0;
                foreach (var line in body.Split('\n', '\r'))
                {
                    var e = ProxyParser.Parse(line, defaultKind, sourceUrl: url);
                    if (e == null) continue;
                    var key = e.ToString();
                    if (!seen.Add(key)) continue;
                    result.Add(e);
                    added++;
                }
                log($"  +{added} (total {result.Count})");
            }
            catch (OperationCanceledException)
            {
                log("Остановлено пользователем — сохраняю частичный результат.");
                break;
            }
            catch (Exception ex)
            {
                log("  ! " + ex.Message);
            }
        }
        return result;
    }
}
