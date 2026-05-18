using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ProxyListChecker.Models;

namespace ProxyListChecker.Services;

public sealed class TestCache
{
    public sealed class Entry
    {
        public string Hash { get; set; } = "";
        public bool Ok { get; set; }
        public int LatencyMs { get; set; }
        public string? ExitIp { get; set; }
        public string? Country { get; set; }
        public string? Anonymity { get; set; }
        public string? Error { get; set; }
        public long Epoch { get; set; }
    }

    private readonly string _path;
    private readonly ConcurrentDictionary<string, Entry> _entries = new();
    private readonly TimeSpan _ttlOk;
    private readonly TimeSpan _ttlFail;
    private readonly object _saveLock = new();

    public TestCache(string path, TimeSpan? ttlOk = null, TimeSpan? ttlFail = null)
    {
        _path = path;
        _ttlOk = ttlOk ?? TimeSpan.FromMinutes(30);
        _ttlFail = ttlFail ?? TimeSpan.FromMinutes(10);
        Load();
    }

    public static string Hash(string key)
    {
        Span<byte> hash = stackalloc byte[20];
        SHA1.HashData(Encoding.UTF8.GetBytes(key), hash);
        return Convert.ToHexString(hash);
    }

    public bool TryGet(string key, out Entry entry)
    {
        var h = Hash(key);
        if (_entries.TryGetValue(h, out var e))
        {
            var age = DateTimeOffset.FromUnixTimeSeconds(e.Epoch);
            var ttl = e.Ok ? _ttlOk : _ttlFail;
            if (DateTimeOffset.UtcNow - age < ttl) { entry = e; return true; }
            _entries.TryRemove(h, out _);
        }
        entry = null!; return false;
    }

    public void Put(string key, CheckResult r)
    {
        var h = Hash(key);
        _entries[h] = new Entry
        {
            Hash = h,
            Ok = r.Ok,
            LatencyMs = r.LatencyMs,
            ExitIp = r.ExitIp,
            Country = r.Country,
            Anonymity = r.Anonymity,
            Error = r.Error,
            Epoch = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
        };
    }

    public int Count => _entries.Count;

    private void Load()
    {
        if (!File.Exists(_path)) return;
        try
        {
            using var fs = File.OpenRead(_path);
            var data = JsonSerializer.Deserialize<List<Entry>>(fs);
            if (data == null) return;
            var now = DateTimeOffset.UtcNow;
            foreach (var e in data)
            {
                var age = DateTimeOffset.FromUnixTimeSeconds(e.Epoch);
                var ttl = e.Ok ? _ttlOk : _ttlFail;
                if (now - age < ttl) _entries[e.Hash] = e;
            }
        }
        catch { }
    }

    public void Save()
    {
        lock (_saveLock)
        {
            try
            {
                var tmp = _path + ".tmp";
                using (var fs = File.Create(tmp))
                    JsonSerializer.Serialize(fs, _entries.Values);
                if (File.Exists(_path)) File.Replace(tmp, _path, null);
                else File.Move(tmp, _path);
            }
            catch { }
        }
    }
}
