using System.Diagnostics;
using System.IO.Compression;
using System.Text.Json;

namespace ProxyListChecker.Services;

/// <summary>
/// Self-update через GitHub releases (greyka/ProxyListChecker).
/// Артефакт — zip "ProxyListChecker-vX.Y.Z-win-x64.zip" (создаётся CI на тег v*).
/// </summary>
public sealed class AppUpdater
{
    private readonly HttpClient _http;
    private readonly string _currentVersion;

    public AppUpdater(string currentVersion)
    {
        _currentVersion = currentVersion;
        _http = new HttpClient { Timeout = TimeSpan.FromMinutes(5) };
        _http.DefaultRequestHeaders.UserAgent.ParseAdd($"ProxyListChecker/{currentVersion}");
        _http.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
    }

    public sealed class ReleaseInfo
    {
        public required string Tag { get; init; }
        public required string Version { get; init; }
        public required string AssetUrl { get; init; }
        public required string AssetName { get; init; }
        public bool IsNewer { get; init; }
    }

    public async Task<ReleaseInfo?> CheckLatestAsync(CancellationToken ct)
    {
        var json = await _http.GetStringAsync("https://api.github.com/repos/greyka/ProxyListChecker/releases/latest", ct);
        using var doc = JsonDocument.Parse(json);
        var tag = doc.RootElement.GetProperty("tag_name").GetString() ?? throw new Exception("tag_name missing");
        string version = tag.TrimStart('v', 'V');

        string? url = null, name = null;
        if (doc.RootElement.TryGetProperty("assets", out var assets))
        {
            foreach (var a in assets.EnumerateArray())
            {
                var n = a.GetProperty("name").GetString() ?? "";
                if (n.StartsWith("ProxyListChecker", StringComparison.OrdinalIgnoreCase) && n.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                {
                    name = n;
                    url = a.GetProperty("browser_download_url").GetString();
                    break;
                }
            }
        }
        if (url == null || name == null) return null;

        return new ReleaseInfo
        {
            Tag = tag,
            Version = version,
            AssetUrl = url,
            AssetName = name,
            IsNewer = CompareVersions(version, _currentVersion) > 0,
        };
    }

    /// <summary>
    /// Скачивает релиз, распаковывает в temp, переименовывает текущий exe → *.old,
    /// копирует новые файлы поверх, стартует новый процесс. После этого вызывающий
    /// должен сделать Application.Exit().
    /// </summary>
    public async Task<string> InstallAsync(ReleaseInfo rel, Action<string> log, CancellationToken ct)
    {
        log($"Скачивание {rel.AssetName}…");
        var tmpZip = Path.Combine(Path.GetTempPath(), $"phs-update-{Guid.NewGuid():N}.zip");
        var tmpDir = Path.Combine(Path.GetTempPath(), $"phs-update-{Guid.NewGuid():N}");
        try
        {
            await using (var net = await _http.GetStreamAsync(rel.AssetUrl, ct))
            await using (var fs = File.Create(tmpZip))
                await net.CopyToAsync(fs, ct);
            long size = new FileInfo(tmpZip).Length;
            log($"  ok ({size / 1024} KB)");

            Directory.CreateDirectory(tmpDir);
            ZipFile.ExtractToDirectory(tmpZip, tmpDir, overwriteFiles: true);

            // Найти новый ProxyListChecker.exe в распакованном
            var newExe = Directory.GetFiles(tmpDir, "ProxyListChecker.exe", SearchOption.AllDirectories).FirstOrDefault()
                         ?? throw new Exception("ProxyListChecker.exe не найден в архиве");
            var newExeDir = Path.GetDirectoryName(newExe)!;

            string currentExe = Environment.ProcessPath ?? Path.Combine(AppContext.BaseDirectory, "ProxyListChecker.exe");
            string targetDir = Path.GetDirectoryName(currentExe)!;

            // Копируем все файлы из распакованного билда. Если файл-получатель
            // существует — пытаемся удалить, при неудаче (file locked) — переименовываем
            // в *.old. Windows позволяет переименовать exe/dll даже когда они загружены
            // в память текущего процесса.
            int copied = 0, renamed = 0;
            foreach (var src in Directory.GetFiles(newExeDir, "*", SearchOption.AllDirectories))
            {
                var rel2 = Path.GetRelativePath(newExeDir, src);
                var dst = Path.Combine(targetDir, rel2);
                Directory.CreateDirectory(Path.GetDirectoryName(dst)!);

                if (File.Exists(dst))
                {
                    bool deleted = false;
                    try { File.Delete(dst); deleted = true; }
                    catch (IOException) { }
                    catch (UnauthorizedAccessException) { }
                    if (!deleted)
                    {
                        var stale = dst + ".old";
                        try { if (File.Exists(stale)) File.Delete(stale); } catch { }
                        try
                        {
                            File.Move(dst, stale);
                            renamed++;
                        }
                        catch (Exception ex)
                        {
                            throw new IOException($"Не могу освободить {Path.GetFileName(dst)}: {ex.Message}");
                        }
                    }
                }
                File.Copy(src, dst, overwrite: false);
                copied++;
            }
            log($"Скопировано файлов: {copied}, переименовано занятых: {renamed}");
            log($"Перезапуск…");

            // Стартуем новый exe и выходим
            var psi = new ProcessStartInfo
            {
                FileName = currentExe,
                UseShellExecute = true,
                WorkingDirectory = targetDir,
            };
            Process.Start(psi);
            return rel.Version;
        }
        finally
        {
            try { File.Delete(tmpZip); } catch { }
            try { Directory.Delete(tmpDir, recursive: true); } catch { }
        }
    }

    /// <summary>Удаляет файлы *.old в каталоге exe. Вызывать на старте.</summary>
    public static void CleanupOldFiles()
    {
        try
        {
            foreach (var f in Directory.GetFiles(AppContext.BaseDirectory, "*.old", SearchOption.AllDirectories))
            {
                try { File.Delete(f); } catch { }
            }
        }
        catch { }
    }

    private static int CompareVersions(string a, string b)
    {
        var pa = a.Split('.').Select(s => int.TryParse(s, out var n) ? n : 0).ToArray();
        var pb = b.Split('.').Select(s => int.TryParse(s, out var n) ? n : 0).ToArray();
        int len = Math.Max(pa.Length, pb.Length);
        for (int i = 0; i < len; i++)
        {
            int va = i < pa.Length ? pa[i] : 0;
            int vb = i < pb.Length ? pb[i] : 0;
            if (va != vb) return va - vb;
        }
        return 0;
    }
}
