using System.Net.Sockets;
using ProxyListChecker.Models;

namespace ProxyListChecker.Services;

/// <summary>
/// Быстрый TCP-чек прокси БЕЗ HttpClient/TLS: DNS resolve + TCP connect.
/// Отсеивает мёртвые порты за миллисекунды, чтобы тяжёлый HTTP-валидатор
/// бил только по живым.
/// </summary>
public static class PreCheck
{
    public record Result(bool Ok, int LatencyMs, string? Error);

    public static async Task<Result> RunAsync(ProxyEntry p, int timeoutMs, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(p.Host) || p.Port <= 0)
            return new Result(false, 0, "no host/port");

        var sw = System.Diagnostics.Stopwatch.StartNew();
        System.Net.IPAddress[] ips;
        try
        {
            using var dnsCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            dnsCts.CancelAfter(timeoutMs);
            ips = await System.Net.Dns.GetHostAddressesAsync(p.Host, dnsCts.Token);
        }
        catch (Exception ex)
        {
            return new Result(false, (int)sw.ElapsedMilliseconds, "dns: " + Short(ex.Message));
        }
        if (ips.Length == 0) return new Result(false, (int)sw.ElapsedMilliseconds, "dns: no records");

        var ip = Array.Find(ips, a => a.AddressFamily == AddressFamily.InterNetwork) ?? ips[0];
        using var tcp = new TcpClient(ip.AddressFamily) { NoDelay = true };
        try
        {
            using var connectCts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            connectCts.CancelAfter(timeoutMs);
            await tcp.ConnectAsync(ip, p.Port, connectCts.Token);
        }
        catch (Exception ex)
        {
            return new Result(false, (int)sw.ElapsedMilliseconds, "tcp: " + Short(ex.Message));
        }
        return new Result(true, (int)sw.ElapsedMilliseconds, null);
    }

    private static string Short(string s)
    {
        s = s.Replace('\n', ' ').Replace('\r', ' ').Trim();
        return s.Length > 60 ? s[..60] + "…" : s;
    }
}
