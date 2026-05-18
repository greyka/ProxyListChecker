namespace ProxyListChecker.Models;

public enum ProxyKind { Http, Https, Socks4, Socks5, Unknown }

public sealed class ProxyEntry
{
    public required ProxyKind Kind { get; init; }
    public required string Host { get; init; }
    public required int Port { get; init; }
    public string? User { get; init; }
    public string? Password { get; init; }
    public string? Source { get; init; }

    public string Address => $"{Host}:{Port}";

    /// <summary>URI вида http://, socks5://, socks4://</summary>
    public Uri ToUri()
    {
        string scheme = Kind switch
        {
            ProxyKind.Https => "http", // HTTPS-proxy через HTTP CONNECT — схема всё равно http
            ProxyKind.Socks4 => "socks4",
            ProxyKind.Socks5 => "socks5",
            _ => "http",
        };
        var ub = new UriBuilder(scheme, Host, Port);
        if (!string.IsNullOrEmpty(User))
        {
            ub.UserName = Uri.EscapeDataString(User);
            if (!string.IsNullOrEmpty(Password)) ub.Password = Uri.EscapeDataString(Password);
        }
        return ub.Uri;
    }

    public override string ToString()
    {
        var prefix = Kind.ToString().ToLowerInvariant();
        var auth = !string.IsNullOrEmpty(User) ? $"{User}:{Password}@" : "";
        return $"{prefix}://{auth}{Host}:{Port}";
    }
}

public sealed class CheckResult
{
    public required ProxyEntry Entry { get; init; }
    public bool Ok { get; init; }
    public int LatencyMs { get; init; }
    public string? ExitIp { get; init; }
    public string? Country { get; init; }
    public string? Anonymity { get; init; }  // transparent / anonymous / elite
    public string? Error { get; init; }
}
