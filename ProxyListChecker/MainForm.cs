using System.ComponentModel;
using System.Diagnostics;
using ProxyListChecker.Models;
using ProxyListChecker.Services;

namespace ProxyListChecker;

public sealed class MainForm : Form
{
    public const string AppVersion = "0.1.0";
    private static readonly string CachePath = Path.Combine(AppContext.BaseDirectory, "test_cache.json");

    private readonly TextBox _sourcesBox;
    private readonly NumericUpDown _threadsBox;
    private readonly NumericUpDown _timeoutBox;
    private readonly TextBox _testUrlBox;
    private readonly ComboBox _typeFilterBox;
    private readonly ComboBox _themeBox;
    private readonly Label _myIpLabel;
    private readonly Button _btnCollect;
    private readonly Button _btnCheck;
    private readonly Button _btnStop;
    private readonly Button _btnSave;
    private readonly Button _btnCopy;
    private readonly Button _btnPurgeFail;
    private readonly Button _btnUpdate;
    private readonly ProgressBar _progress;
    private readonly TextBox _log;
    private readonly DataGridView _grid;
    private readonly StatusStrip _statusStrip;
    private readonly ToolStripStatusLabel _statusLabel;
    private readonly ToolStripStatusLabel _statusCounts;

    private readonly BindingList<RowVm> _rows = new();
    private readonly List<ProxyEntry> _collected = new();
    private readonly TestCache _cache = new(CachePath);
    private CancellationTokenSource? _cts;
    private string? _myExternalIp;

    public MainForm()
    {
        Text = $"ProxyListChecker v{AppVersion} — HTTP/SOCKS4/SOCKS5 mass-validator";
        Width = 1400; Height = 920;
        MinimumSize = new Size(1100, 720);
        StartPosition = FormStartPosition.CenterScreen;
        Font = new Font("Segoe UI", 9f);

        _statusStrip = new StatusStrip();
        _statusLabel = new ToolStripStatusLabel("Готов") { Spring = true, TextAlign = ContentAlignment.MiddleLeft };
        _statusCounts = new ToolStripStatusLabel("") { TextAlign = ContentAlignment.MiddleRight };
        _statusStrip.Items.Add(_statusLabel);
        _statusStrip.Items.Add(_statusCounts);

        // === root: 2 cols x 6 rows ===
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, RowCount = 6 };
        root.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        root.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 540));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 270)); // header
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 100)); // buttons
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 22));  // progress
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 70));   // grid
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 30));   // log
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 32));  // status
        Controls.Add(root);

        // ====== sources ======
        var sourcesGroup = new GroupBox { Text = "Источники proxy-листов (по одному URL на строку)", Dock = DockStyle.Fill, Padding = new Padding(6) };
        _sourcesBox = new TextBox { Multiline = true, ScrollBars = ScrollBars.Both, Dock = DockStyle.Fill, WordWrap = false, AcceptsReturn = true, Font = new Font("Consolas", 9f) };
        sourcesGroup.Controls.Add(_sourcesBox);
        root.Controls.Add(sourcesGroup, 0, 0);

        // ====== options ======
        var optGroup = new GroupBox { Text = "Параметры", Dock = DockStyle.Fill, Padding = new Padding(8) };
        var opt = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 3, RowCount = 7 };
        opt.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 140));
        opt.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        opt.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 170));
        for (int i = 0; i < 7; i++) opt.RowStyles.Add(new RowStyle(SizeType.Absolute, 34));
        optGroup.Controls.Add(opt);
        root.Controls.Add(optGroup, 1, 0);

        opt.Controls.Add(MakeLabel("Мой внешний IP:"), 0, 0);
        _myIpLabel = new Label { Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft, ForeColor = Color.DimGray, Tag = "hint", Text = "определяется…" };
        opt.Controls.Add(_myIpLabel, 1, 0);
        _btnUpdate = new Button { Text = "Обновить", Dock = DockStyle.Fill, Margin = new Padding(3) };
        opt.Controls.Add(_btnUpdate, 2, 0);

        opt.Controls.Add(MakeLabel("Тип фильтра:"), 0, 1);
        _typeFilterBox = new ComboBox { Dock = DockStyle.Left, Width = 160, DropDownStyle = ComboBoxStyle.DropDownList };
        _typeFilterBox.Items.AddRange(new object[] { "Все", "HTTP", "HTTPS", "SOCKS4", "SOCKS5" });
        _typeFilterBox.SelectedIndex = 0;
        opt.Controls.Add(_typeFilterBox, 1, 1);

        opt.Controls.Add(MakeLabel("Потоки:"), 0, 2);
        _threadsBox = new NumericUpDown { Minimum = 1, Maximum = 500, Value = 100, Anchor = AnchorStyles.Left, Width = 80 };
        opt.Controls.Add(_threadsBox, 1, 2);

        opt.Controls.Add(MakeLabel("Таймаут (мс):"), 0, 3);
        _timeoutBox = new NumericUpDown { Minimum = 1000, Maximum = 30000, Increment = 500, Value = 6000, Anchor = AnchorStyles.Left, Width = 100 };
        opt.Controls.Add(_timeoutBox, 1, 3);

        opt.Controls.Add(MakeLabel("Тест URL:"), 0, 4);
        _testUrlBox = new TextBox { Text = "https://api.ipify.org", Dock = DockStyle.Fill };
        opt.Controls.Add(_testUrlBox, 1, 4);

        opt.Controls.Add(MakeLabel("Подсказка:"), 0, 5);
        var hint = new Label { Text = "1) «Собрать» → 2) «Проверить» → «Сохранить рабочие».", Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft, ForeColor = Color.DimGray, Tag = "hint" };
        opt.Controls.Add(hint, 1, 5);
        opt.SetColumnSpan(hint, 2);

        opt.Controls.Add(MakeLabel("Тема:"), 0, 6);
        _themeBox = new ComboBox { Dock = DockStyle.Left, Width = 160, DropDownStyle = ComboBoxStyle.DropDownList };
        _themeBox.Items.AddRange(new object[] { "Светлая", "Матрица" });
        _themeBox.SelectedIndex = 0;
        opt.Controls.Add(_themeBox, 1, 6);

        // ====== buttons ======
        var buttons = new FlowLayoutPanel { Dock = DockStyle.Fill, FlowDirection = FlowDirection.LeftToRight, Padding = new Padding(4), WrapContents = true };
        _btnCollect = new Button { Text = "1. Собрать", BackColor = Color.FromArgb(220, 235, 220) };
        _btnCheck = new Button { Text = "2. Проверить", BackColor = Color.FromArgb(220, 230, 245) };
        _btnStop = new Button { Text = "Стоп", Enabled = false };
        _btnSave = new Button { Text = "Сохранить рабочие" };
        _btnCopy = new Button { Text = "Копировать в буфер" };
        _btnPurgeFail = new Button { Text = "Удалить нерабочие" };
        foreach (var b in new[] { _btnCollect, _btnCheck, _btnStop, _btnSave, _btnCopy, _btnPurgeFail })
        {
            b.AutoSize = true;
            b.AutoSizeMode = AutoSizeMode.GrowAndShrink;
            b.Padding = new Padding(10, 4, 10, 4);
            b.Margin = new Padding(3);
            b.MinimumSize = new Size(0, 34);
        }
        buttons.Controls.AddRange(new Control[] { _btnCollect, _btnCheck, _btnStop, _btnSave, _btnCopy, _btnPurgeFail });
        root.Controls.Add(buttons, 0, 1);
        root.SetColumnSpan(buttons, 2);

        _progress = new ProgressBar { Dock = DockStyle.Fill, Style = ProgressBarStyle.Continuous };
        root.Controls.Add(_progress, 0, 2);
        root.SetColumnSpan(_progress, 2);

        // ====== grid ======
        _grid = new DataGridView
        {
            Dock = DockStyle.Fill,
            AllowUserToAddRows = false,
            AllowUserToDeleteRows = false,
            AutoGenerateColumns = false,
            AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
            SelectionMode = DataGridViewSelectionMode.FullRowSelect,
            RowHeadersVisible = false,
            AlternatingRowsDefaultCellStyle = new DataGridViewCellStyle { BackColor = Color.FromArgb(245, 245, 250) },
            EnableHeadersVisualStyles = false,
        };
        _grid.Columns.Add(new DataGridViewCheckBoxColumn { Name = "Sel", HeaderText = "✓", DataPropertyName = nameof(RowVm.Selected), FillWeight = 3, MinimumWidth = 28 });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "Type", HeaderText = "Тип", DataPropertyName = nameof(RowVm.Type), FillWeight = 6, MinimumWidth = 60, ReadOnly = true });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "Status", HeaderText = "Статус", DataPropertyName = nameof(RowVm.Status), FillWeight = 6, MinimumWidth = 60, ReadOnly = true });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "Ms", HeaderText = "ms", DataPropertyName = nameof(RowVm.LatencyMs), FillWeight = 4, MinimumWidth = 50, ReadOnly = true });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "Addr", HeaderText = "Адрес", DataPropertyName = nameof(RowVm.Address), FillWeight = 14, MinimumWidth = 140, ReadOnly = true });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "Exit", HeaderText = "Exit IP", DataPropertyName = nameof(RowVm.ExitIp), FillWeight = 12, MinimumWidth = 110, ReadOnly = true });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "Anon", HeaderText = "Anonimity", DataPropertyName = nameof(RowVm.Anonymity), FillWeight = 8, MinimumWidth = 80, ReadOnly = true });
        _grid.Columns.Add(new DataGridViewTextBoxColumn { Name = "Err", HeaderText = "Ошибка / источник", DataPropertyName = nameof(RowVm.Note), FillWeight = 40, MinimumWidth = 200, ReadOnly = true, DefaultCellStyle = new DataGridViewCellStyle { Font = new Font("Consolas", 8.5f) } });
        _grid.DataSource = _rows;
        root.Controls.Add(_grid, 0, 3);
        root.SetColumnSpan(_grid, 2);

        // ====== log ======
        var logGroup = new GroupBox { Text = "Лог", Dock = DockStyle.Fill, Padding = new Padding(4) };
        _log = new TextBox { Multiline = true, ScrollBars = ScrollBars.Vertical, Dock = DockStyle.Fill, ReadOnly = true, Font = new Font("Consolas", 9f), WordWrap = false, BackColor = Color.Black, ForeColor = Color.LightGreen };
        logGroup.Controls.Add(_log);
        root.Controls.Add(logGroup, 0, 4);
        root.SetColumnSpan(logGroup, 2);

        var statusHost = new Panel { Dock = DockStyle.Fill };
        statusHost.Controls.Add(_statusStrip);
        _statusStrip.Dock = DockStyle.Fill;
        root.Controls.Add(statusHost, 0, 5);
        root.SetColumnSpan(statusHost, 2);

        // events
        _btnCollect.Click += async (_, _) => await OnCollect();
        _btnCheck.Click += async (_, _) => await OnCheck();
        _btnStop.Click += (_, _) => _cts?.Cancel();
        _btnSave.Click += OnSave;
        _btnCopy.Click += OnCopy;
        _btnPurgeFail.Click += OnPurge;
        _btnUpdate.Click += async (_, _) => await OnUpdateApp();
        _themeBox.SelectedIndexChanged += (_, _) => ApplyCurrentTheme();

        LoadDefaults();
        _ = DetectExternalIpAsync();
    }

    private static Label MakeLabel(string text) => new() { Text = text, Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft };

    private void LoadDefaults()
    {
        try
        {
            var f = Path.Combine(AppContext.BaseDirectory, "default_sources.txt");
            if (File.Exists(f)) _sourcesBox.Text = string.Join(Environment.NewLine, File.ReadAllLines(f));
        }
        catch { }
    }

    private async Task DetectExternalIpAsync()
    {
        try
        {
            using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(6) };
            http.DefaultRequestHeaders.UserAgent.ParseAdd("ProxyListChecker/" + AppVersion);
            var ip = (await http.GetStringAsync("https://api.ipify.org")).Trim();
            if (System.Net.IPAddress.TryParse(ip, out _))
            {
                _myExternalIp = ip;
                BeginInvoke(() =>
                {
                    _myIpLabel.Text = ip;
                    _myIpLabel.Tag = "hint";
                });
            }
        }
        catch
        {
            BeginInvoke(() => _myIpLabel.Text = "не удалось определить");
        }
    }

    private void ApplyCurrentTheme()
    {
        var theme = _themeBox.SelectedIndex == 1 ? AppTheme.Matrix : AppTheme.Light;
        ThemePainter.Apply(this, theme);
    }

    private void Log(string msg)
    {
        if (InvokeRequired) { BeginInvoke(() => Log(msg)); return; }
        _log.AppendText($"[{DateTime.Now:HH:mm:ss}] {msg}{Environment.NewLine}");
    }

    private void SetBusy(bool busy)
    {
        _btnCollect.Enabled = !busy;
        _btnCheck.Enabled = !busy;
        _btnSave.Enabled = !busy;
        _btnCopy.Enabled = !busy;
        _btnPurgeFail.Enabled = !busy;
        _btnStop.Enabled = busy;
    }

    private void SetStatus(string main, string? counts = null)
    {
        if (InvokeRequired) { BeginInvoke(() => SetStatus(main, counts)); return; }
        _statusLabel.Text = main;
        if (counts != null) _statusCounts.Text = counts;
    }

    private async Task OnCollect()
    {
        var urls = _sourcesBox.Lines.Select(l => l.Trim()).Where(l => l.Length > 0 && !l.StartsWith("#")).ToArray();
        if (urls.Length == 0) { MessageBox.Show(this, "Укажите URL источников.", "Нет источников", MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }

        _cts = new CancellationTokenSource();
        SetBusy(true); SetStatus("Сбор…");
        _progress.Style = ProgressBarStyle.Marquee;
        try
        {
            var fetcher = new SourceFetcher();
            var list = await fetcher.FetchAllAsync(urls, Log, _cts.Token);
            // фильтр по типу
            var filter = _typeFilterBox.SelectedIndex switch
            {
                1 => (Func<ProxyEntry, bool>)(e => e.Kind == ProxyKind.Http),
                2 => e => e.Kind == ProxyKind.Https,
                3 => e => e.Kind == ProxyKind.Socks4,
                4 => e => e.Kind == ProxyKind.Socks5,
                _ => _ => true,
            };
            var filtered = list.Where(filter).ToList();

            _collected.Clear(); _collected.AddRange(filtered);
            _rows.Clear();
            foreach (var e in filtered)
                _rows.Add(new RowVm { Entry = e, Type = e.Kind.ToString(), Status = "—", Address = e.Address, Note = e.Source ?? "" });

            Log($"Собрано уникальных: {filtered.Count} (всего из источников: {list.Count})");
            SetStatus("Готов", $"Собрано: {filtered.Count}");
        }
        catch (OperationCanceledException) { Log("Отменено."); }
        catch (Exception ex) { Log("Ошибка: " + ex.Message); }
        finally { _progress.Style = ProgressBarStyle.Continuous; SetBusy(false); }
    }

    private async Task OnCheck()
    {
        if (_collected.Count == 0) { MessageBox.Show(this, "Сначала «Собрать».", "Пусто", MessageBoxButtons.OK, MessageBoxIcon.Information); return; }
        _cts = new CancellationTokenSource();
        SetBusy(true);

        int threads = (int)_threadsBox.Value;
        int timeoutMs = (int)_timeoutBox.Value;
        string testUrl = _testUrlBox.Text.Trim();
        if (string.IsNullOrEmpty(testUrl)) testUrl = "https://api.ipify.org";

        _progress.Minimum = 0; _progress.Maximum = _collected.Count; _progress.Value = 0;
        Log($"Проверка: {_collected.Count} прокси, потоков {threads}, таймаут {timeoutMs}мс, тест {testUrl}");
        var sw = System.Diagnostics.Stopwatch.StartNew();

        int done = 0, ok = 0, cacheHits = 0;
        var pending = new System.Collections.Concurrent.ConcurrentQueue<(int idx, CheckResult r)>();
        void FlushBatch()
        {
            var batch = new List<(int, CheckResult)>(64);
            while (batch.Count < 256 && pending.TryDequeue(out var x)) batch.Add(x);
            if (batch.Count > 0) ApplyResults(batch);
        }

        var validator = new ProxyValidator { TestUrl = testUrl, Timeout = TimeSpan.FromMilliseconds(timeoutMs), MyExternalIp = _myExternalIp };
        using var sem = new SemaphoreSlim(threads, threads);
        try
        {
            var tasks = new List<Task>(_collected.Count);
            for (int i = 0; i < _collected.Count; i++)
            {
                int idx = i;
                await sem.WaitAsync(_cts.Token);
                tasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        var key = _collected[idx].ToString();
                        CheckResult r;
                        if (_cache.TryGet(key, out var hit))
                        {
                            r = new CheckResult { Entry = _collected[idx], Ok = hit.Ok, LatencyMs = hit.LatencyMs, ExitIp = hit.ExitIp, Country = hit.Country, Anonymity = hit.Anonymity, Error = hit.Error };
                            Interlocked.Increment(ref cacheHits);
                        }
                        else
                        {
                            r = await validator.CheckAsync(_collected[idx], _cts.Token);
                            _cache.Put(key, r);
                        }
                        if (r.Ok) Interlocked.Increment(ref ok);
                        pending.Enqueue((idx, r));
                        int d = Interlocked.Increment(ref done);
                        if (d % 32 == 0 || d == _collected.Count)
                            BeginInvoke(() => { _progress.Value = Math.Min(d, _progress.Maximum); SetStatus($"Проверка: {d}/{_collected.Count}", $"OK: {ok} · кэш: {cacheHits}"); FlushBatch(); });
                    }
                    finally { sem.Release(); }
                }, _cts.Token));
            }
            await Task.WhenAll(tasks);
            while (!pending.IsEmpty) FlushBatch();
            sw.Stop();
            _cache.Save();
            Log($"Готово за {sw.Elapsed.TotalSeconds:F1}с. OK: {ok}/{_collected.Count}, кэш-хитов: {cacheHits}");
            SetStatus("Готов", $"OK: {ok}/{_collected.Count}");
        }
        catch (OperationCanceledException) { _cache.Save(); Log("Отменено."); }
        catch (Exception ex) { Log("Ошибка: " + ex.Message); }
        finally { SetBusy(false); }
    }

    private void ApplyResults(IEnumerable<(int idx, CheckResult r)> results)
    {
        if (InvokeRequired) { BeginInvoke(() => ApplyResults(results)); return; }
        foreach (var (idx, r) in results)
        {
            if (idx < 0 || idx >= _rows.Count) continue;
            var row = _rows[idx];
            row.Status = r.Ok ? "OK" : "FAIL";
            row.LatencyMs = r.LatencyMs > 0 ? r.LatencyMs : 0;
            row.ExitIp = r.ExitIp ?? "";
            row.Anonymity = r.Anonymity ?? "";
            if (!r.Ok && !string.IsNullOrEmpty(r.Error)) row.Note = r.Error;
            _rows.ResetItem(idx);
        }
    }

    private List<RowVm> WorkingRows() =>
        _rows.Where(r => r.Status == "OK").OrderBy(r => r.LatencyMs > 0 ? r.LatencyMs : int.MaxValue).ToList();

    private void OnSave(object? sender, EventArgs e)
    {
        var ok = WorkingRows();
        if (ok.Count == 0) { MessageBox.Show(this, "Нет рабочих.", "Пусто", MessageBoxButtons.OK, MessageBoxIcon.Information); return; }
        using var dlg = new SaveFileDialog { FileName = "valid_proxies.txt", Filter = "Text|*.txt" };
        if (dlg.ShowDialog(this) != DialogResult.OK) return;

        File.WriteAllLines(dlg.FileName, ok.Select(r => r.Entry.ToString()));
        // также раскладка по типам
        var dir = Path.Combine(Path.GetDirectoryName(dlg.FileName)!, "by_type");
        Directory.CreateDirectory(dir);
        foreach (var grp in ok.GroupBy(r => r.Entry.Kind))
            File.WriteAllLines(Path.Combine(dir, grp.Key.ToString().ToLower() + ".txt"), grp.Select(r => r.Entry.ToString()));
        Log($"Сохранено {ok.Count} → {dlg.FileName} + by_type/");
    }

    private void OnCopy(object? sender, EventArgs e)
    {
        var ok = WorkingRows();
        if (ok.Count == 0) { MessageBox.Show(this, "Нет рабочих.", "Пусто", MessageBoxButtons.OK, MessageBoxIcon.Information); return; }
        Clipboard.SetText(string.Join(Environment.NewLine, ok.Select(r => r.Entry.ToString())));
        Log($"Скопировано: {ok.Count}");
    }

    private void OnPurge(object? sender, EventArgs e)
    {
        var toRemove = _rows.Where(r => r.Status != "OK").ToList();
        if (toRemove.Count == 0) { MessageBox.Show(this, "Нечего удалять.", "Пусто", MessageBoxButtons.OK, MessageBoxIcon.Information); return; }
        var keep = new HashSet<string>(_rows.Except(toRemove).Select(r => r.Entry.ToString()), StringComparer.OrdinalIgnoreCase);
        foreach (var r in toRemove) _rows.Remove(r);
        _collected.RemoveAll(c => !keep.Contains(c.ToString()));
        Log($"Удалено {toRemove.Count}. Осталось {_rows.Count}.");
    }

    private async Task OnUpdateApp()
    {
        _btnUpdate.Enabled = false;
        try
        {
            Log($"Проверка обновлений (текущая {AppVersion})…");
            var updater = new AppUpdater(AppVersion);
            var rel = await updater.CheckLatestAsync(CancellationToken.None);
            if (rel == null)
            {
                MessageBox.Show(this, "На GitHub пока нет релиза с zip.", "Нет обновления", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }
            if (!rel.IsNewer)
            {
                MessageBox.Show(this, $"Актуальная версия {AppVersion}.", "OK", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }
            var dr = MessageBox.Show(this, $"Доступна {rel.Version} (у вас {AppVersion}). Скачать и перезапустить?", "Обновление", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
            if (dr != DialogResult.Yes) return;
            await updater.InstallAsync(rel, Log, CancellationToken.None);
            await Task.Delay(800);
            Application.Exit();
        }
        catch (Exception ex)
        {
            Log("Ошибка обновления: " + ex.Message);
            MessageBox.Show(this, ex.Message, "Не удалось", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally { _btnUpdate.Enabled = true; }
    }
}

public sealed class RowVm
{
    public bool Selected { get; set; }
    public ProxyEntry Entry { get; set; } = default!;
    public string Type { get; set; } = "";
    public string Status { get; set; } = "";
    public int LatencyMs { get; set; }
    public string Address { get; set; } = "";
    public string ExitIp { get; set; } = "";
    public string Anonymity { get; set; } = "";
    public string Note { get; set; } = "";
}
