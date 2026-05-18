using System.Text.Json;

namespace ProxyListChecker.Services;

/// <summary>
/// Все пользовательские настройки UI/чека. Сохраняются в settings.json рядом с exe.
/// </summary>
public sealed class AppSettings
{
    public string? Sources { get; set; }
    public int Threads { get; set; }
    public int Timeout { get; set; }
    public string? TestUrl { get; set; }
    public int GoalOk { get; set; }
    public bool Shuffle { get; set; }
    public string? MxHost { get; set; }
    public int CycleInterval { get; set; }
    public bool CycleHttp { get; set; } = true;
    public bool CycleMx { get; set; }
    public int Theme { get; set; }
    public int TypeFilter { get; set; }

    private static readonly string Path = System.IO.Path.Combine(AppContext.BaseDirectory, "settings.json");
    private static readonly JsonSerializerOptions Opts = new() { WriteIndented = true };

    public static AppSettings? Load()
    {
        try
        {
            if (!File.Exists(Path)) return null;
            return JsonSerializer.Deserialize<AppSettings>(File.ReadAllText(Path));
        }
        catch { return null; }
    }

    public void Save()
    {
        try { File.WriteAllText(Path, JsonSerializer.Serialize(this, Opts)); }
        catch { }
    }
}
