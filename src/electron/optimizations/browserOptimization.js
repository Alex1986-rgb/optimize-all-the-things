
const { runPowerShellCommand } = require('../utils/commandUtils');
const log = require('electron-log');

// Отключение фоновых процессов браузеров
async function stopBrowserBackgroundProcesses() {
  try {
    // Закрытие всех браузеров
    await runPowerShellCommand('Get-Process chrome* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process msedge* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process firefox* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process opera* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process browser* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process yandex* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    
    // Отключение автозапуска браузеров
    await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Chrome" -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Microsoft Edge" -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Yandex" -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Opera" -ErrorAction SilentlyContinue');
    
    // Отключение фоновой работы для всех браузеров
    await runPowerShellCommand('reg add "HKCU\\Software\\Google\\Chrome\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f');
    await runPowerShellCommand('reg add "HKCU\\Software\\Microsoft\\Edge\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f');
    await runPowerShellCommand('reg add "HKCU\\Software\\Yandex\\YandexBrowser\\Background" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f');
    await runPowerShellCommand('reg add "HKCU\\Software\\Opera Software\\Preferences" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f');
    
    return true;
  } catch (error) {
    log.error('Error stopping browser processes:', error);
    return false;
  }
}

module.exports = {
  stopBrowserBackgroundProcesses
};
