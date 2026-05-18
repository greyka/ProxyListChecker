using System.Net;
using System.Net.Http;
using ProxyListChecker.Models;

namespace ProxyListChecker.Services;

/// <summary>
/// Реальная проверка прокси: HttpClient через прокси → запрос на тест-URL,
/// возвращающий внешний IP. Поддерживает HTTP/HTTPS-прокси и SOCKS4/5 (нативно в .NET 6+).
/// </summary>
public sealed class ProxyValidator
{
    public string TestUrl { get; init; } = "https://api.ipify.org";
    public TimeSpan Timeout { get; init; } = TimeSpan.FromSeconds(8);
    public string? MyExternalIp { get; init; } // если знаем — для классификации anonymity

    public async Task<CheckResult> CheckAsync(ProxyEntry p, CancellationToken ct)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            var proxy = new WebProxy(p.ToUri()) { BypassProxyOnLocal = false };
            if (!string.IsNullOrEmpty(p.User))
                proxy.Credentials = new NetworkCredential(p.User, p.Password ?? "");

            var handler = new SocketsHttpHandler
            {
                Proxy = proxy,
                UseProxy = true,
                AllowAutoRedirect = false,
                ConnectTimeout = Timeout,
                SslOptions = new System.Net.Security.SslClientAuthenticationOptions
                {
                    RemoteCertificateValidationCallback = (_, _, _, _) => true,
                },
            };
            using var http = new HttpClient(handler) { Timeout = Timeout };
            http.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 ProxyListChecker/1.0");

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(Timeout);
            var resp = await http.GetAsync(TestUrl, HttpCompletionOption.ResponseContentRead, cts.Token);
            sw.Stop();

            if (!resp.IsSuccessStatusCode)
                return new CheckResult { Entry = p, Ok = false, LatencyMs = (int)sw.ElapsedMilliseconds, Error = $"HTTP {(int)resp.StatusCode}" };

            var body = (await resp.Content.ReadAsStringAsync(cts.Token)).Trim();
            string? exitIp = null;
            // ipify возвращает чистый IP; если получили — окей
            if (System.Net.IPAddress.TryParse(body, out _))
                exitIp = body;

            string? anon = null;
            if (exitIp != null && !string.IsNullOrEmpty(MyExternalIp))
                anon = exitIp == MyExternalIp ? "transparent" : "anonymous";

            return new CheckResult
            {
                Entry = p,
                Ok = true,
                LatencyMs = (int)sw.ElapsedMilliseconds,
                ExitIp = exitIp,
                Anonymity = anon,
            };
        }
        catch (TaskCanceledException)
        {
            return new CheckResult { Entry = p, Ok = false, LatencyMs = (int)sw.ElapsedMilliseconds, Error = "timeout" };
        }
        catch (HttpRequestException ex) when (ex.InnerException != null)
        {
            return new CheckResult { Entry = p, Ok = false, LatencyMs = (int)sw.ElapsedMilliseconds, Error = Short(ex.InnerException.Message) };
        }
        catch (Exception ex)
        {
            return new CheckResult { Entry = p, Ok = false, LatencyMs = (int)sw.ElapsedMilliseconds, Error = Short(ex.Message) };
        }
    }

    private static string Short(string s)
    {
        s = s.Replace('\n', ' ').Replace('\r', ' ').Trim();
        return s.Length > 80 ? s[..80] + "…" : s;
    }
}
