namespace ProxyListChecker;

static class Program
{
    [STAThread]
    static void Main()
    {
        Services.AppUpdater.CleanupOldFiles();
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm());
    }
}
