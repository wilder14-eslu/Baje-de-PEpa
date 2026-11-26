using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace BajeDePepaLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string htmlPath = Path.Combine(baseDir, "index.html");

                if (!File.Exists(htmlPath))
                {
                    MessageBox.Show(
                        "No se encontró el archivo index.html en: " + baseDir,
                        "Baje de Pepa - Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                string fileUri = "file:///" + htmlPath.Replace('\\', '/');

                // Try finding Edge or Chrome to run in standalone app window mode
                string[] browserPaths = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
                };

                string chosenBrowser = null;
                foreach (string path in browserPaths)
                {
                    if (File.Exists(path))
                    {
                        chosenBrowser = path;
                        break;
                    }
                }

                if (chosenBrowser != null)
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = chosenBrowser;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=680,840 --disable-features=Translate", fileUri);
                    psi.UseShellExecute = false;
                    Process.Start(psi);
                }
                else
                {
                    // Fallback to default browser
                    Process.Start(new ProcessStartInfo(fileUri) { UseShellExecute = true });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Error al iniciar Baje de Pepa: " + ex.Message,
                    "Baje de Pepa",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
