using System.Net;
using System.Net.Sockets;
using System.Text;
using ProxyListChecker.Models;

namespace ProxyListChecker.Services;

/// <summary>
/// Проверка: через прокси можно открыть TCP-туннель на SMTP-сервер (порт 25)
/// и получить banner '220 …'. Поддерживает HTTP/HTTPS/SOCKS4/SOCKS5.
/// </summary>
public sealed class MxChecker
{
    public string MxHost { get; init; } = "gmail-smtp-in.l.google.com";
    public int MxPort { get; init; } = 25;
    public TimeSpan Timeout { get; init; } = TimeSpan.FromSeconds(8);

    public sealed record Result(bool Ok, string? Banner, string? Error, int LatencyMs);

    public async Task<Result> CheckAsync(ProxyEntry p, CancellationToken ct)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            using var tcp = new TcpClient { NoDelay = true };
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(Timeout);

            await tcp.ConnectAsync(p.Host, p.Port, cts.Token);
            var stream = tcp.GetStream();
            stream.ReadTimeout = (int)Timeout.TotalMilliseconds;
            stream.WriteTimeout = (int)Timeout.TotalMilliseconds;

            switch (p.Kind)
            {
                case ProxyKind.Http:
                case ProxyKind.Https:
                    await DoHttpConnect(stream, MxHost, MxPort, p.User, p.Password, cts.Token);
                    break;
                case ProxyKind.Socks5:
                    await DoSocks5Connect(stream, MxHost, MxPort, p.User, p.Password, cts.Token);
                    break;
                case ProxyKind.Socks4:
                    await DoSocks4Connect(stream, MxHost, MxPort, p.User, cts.Token);
                    break;
                default:
                    return new Result(false, null, "proxy kind not supported", (int)sw.ElapsedMilliseconds);
            }

            // Читаем SMTP-banner (до 256 байт; ждём до Timeout)
            var buf = new byte[256];
            int n;
            try
            {
                n = await stream.ReadAsync(buf.AsMemory(0, buf.Length), cts.Token);
            }
            catch (Exception ex)
            {
                return new Result(false, null, "no banner: " + Short(ex.Message), (int)sw.ElapsedMilliseconds);
            }
            if (n <= 0) return new Result(false, null, "empty banner", (int)sw.ElapsedMilliseconds);

            var banner = Encoding.ASCII.GetString(buf, 0, n).Trim();
            if (!banner.StartsWith("220", StringComparison.Ordinal))
                return new Result(false, banner, "not SMTP banner", (int)sw.ElapsedMilliseconds);

            // bannering OK; first line
            var firstLine = banner.Split('\n')[0].TrimEnd('\r');
            return new Result(true, firstLine, null, (int)sw.ElapsedMilliseconds);
        }
        catch (OperationCanceledException)
        {
            return new Result(false, null, "timeout", (int)sw.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            return new Result(false, null, Short(ex.Message), (int)sw.ElapsedMilliseconds);
        }
    }

    private static async Task DoHttpConnect(NetworkStream s, string host, int port, string? user, string? pass, CancellationToken ct)
    {
        var sb = new StringBuilder();
        sb.Append("CONNECT ").Append(host).Append(':').Append(port).Append(" HTTP/1.1\r\n");
        sb.Append("Host: ").Append(host).Append(':').Append(port).Append("\r\n");
        if (!string.IsNullOrEmpty(user))
        {
            var creds = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{user}:{pass ?? ""}"));
            sb.Append("Proxy-Authorization: Basic ").Append(creds).Append("\r\n");
        }
        sb.Append("\r\n");
        var req = Encoding.ASCII.GetBytes(sb.ToString());
        await s.WriteAsync(req, ct);

        var buf = new byte[1024];
        int n = await s.ReadAsync(buf.AsMemory(0, buf.Length), ct);
        if (n <= 0) throw new IOException("no CONNECT response");
        var resp = Encoding.ASCII.GetString(buf, 0, n);
        var firstLine = resp.Split('\n')[0].TrimEnd('\r');
        if (!firstLine.Contains(" 200"))
            throw new IOException("HTTP CONNECT: " + firstLine);
    }

    private static async Task DoSocks5Connect(NetworkStream s, string host, int port, string? user, string? pass, CancellationToken ct)
    {
        bool wantAuth = !string.IsNullOrEmpty(user);
        var greet = wantAuth ? new byte[] { 0x05, 0x02, 0x00, 0x02 } : new byte[] { 0x05, 0x01, 0x00 };
        await s.WriteAsync(greet, ct);

        var resp = new byte[2];
        await s.ReadExactlyAsync(resp.AsMemory(0, 2), ct);
        if (resp[0] != 0x05) throw new IOException("SOCKS5: not v5");
        byte method = resp[1];
        if (method == 0xFF) throw new IOException("SOCKS5: no acceptable methods");
        if (method == 0x02)
        {
            var u = Encoding.ASCII.GetBytes(user ?? "");
            var p2 = Encoding.ASCII.GetBytes(pass ?? "");
            var auth = new byte[3 + u.Length + p2.Length];
            int o = 0;
            auth[o++] = 0x01;
            auth[o++] = (byte)u.Length; Array.Copy(u, 0, auth, o, u.Length); o += u.Length;
            auth[o++] = (byte)p2.Length; Array.Copy(p2, 0, auth, o, p2.Length); o += p2.Length;
            await s.WriteAsync(auth, ct);
            await s.ReadExactlyAsync(resp.AsMemory(0, 2), ct);
            if (resp[1] != 0x00) throw new IOException("SOCKS5 auth fail");
        }

        var h = Encoding.ASCII.GetBytes(host);
        var req = new byte[4 + 1 + h.Length + 2];
        req[0] = 0x05; req[1] = 0x01; req[2] = 0x00; req[3] = 0x03;
        req[4] = (byte)h.Length;
        Array.Copy(h, 0, req, 5, h.Length);
        req[5 + h.Length] = (byte)(port >> 8);
        req[5 + h.Length + 1] = (byte)(port & 0xFF);
        await s.WriteAsync(req, ct);

        var rep = new byte[4];
        await s.ReadExactlyAsync(rep.AsMemory(0, 4), ct);
        if (rep[1] != 0x00) throw new IOException("SOCKS5 connect rep=" + rep[1]);
        byte atyp = rep[3];
        int skip = atyp switch { 0x01 => 4 + 2, 0x04 => 16 + 2, 0x03 => -1, _ => 0 };
        if (skip == -1)
        {
            var lenBuf = new byte[1];
            await s.ReadExactlyAsync(lenBuf.AsMemory(0, 1), ct);
            skip = lenBuf[0] + 2;
        }
        if (skip > 0)
        {
            var trash = new byte[skip];
            await s.ReadExactlyAsync(trash.AsMemory(0, skip), ct);
        }
    }

    private static async Task DoSocks4Connect(NetworkStream s, string host, int port, string? user, CancellationToken ct)
    {
        var ips = await Dns.GetHostAddressesAsync(host, ct);
        var ip = ips.FirstOrDefault(a => a.AddressFamily == AddressFamily.InterNetwork)
                 ?? throw new IOException("SOCKS4 needs IPv4");
        var ipBytes = ip.GetAddressBytes();
        var userBytes = Encoding.ASCII.GetBytes(user ?? "");
        var req = new byte[9 + userBytes.Length];
        req[0] = 0x04; req[1] = 0x01;
        req[2] = (byte)(port >> 8); req[3] = (byte)(port & 0xFF);
        Array.Copy(ipBytes, 0, req, 4, 4);
        Array.Copy(userBytes, 0, req, 8, userBytes.Length);
        req[req.Length - 1] = 0x00;
        await s.WriteAsync(req, ct);
        var rep = new byte[8];
        await s.ReadExactlyAsync(rep.AsMemory(0, 8), ct);
        if (rep[1] != 0x5A) throw new IOException("SOCKS4 rep=" + rep[1]);
    }

    private static string Short(string s)
    {
        s = s.Replace('\n', ' ').Replace('\r', ' ').Trim();
        return s.Length > 70 ? s[..70] + "…" : s;
    }
}
