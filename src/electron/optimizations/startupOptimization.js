
const { runPowerShellCommand } = require('../utils/commandUtils');
const log = require('electron-log');

// Оптимизация автозагрузки
async function optimizeStartup() {
  try {
    await runPowerShellCommand('Get-CimInstance Win32_StartupCommand | Select-Object Command, Description | Format-Table -AutoSize');
    
    // Отключение ненужных элементов автозагрузки
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Steam Client Bootstrapper" /f');
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Discord" /f');
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Spotify" /f');
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "EpicGamesLauncher" /f');
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Skype" /f');
    
    return true;
  } catch (error) {
    log.error('Error optimizing startup:', error);
    return false;
  }
}

module.exports = {
  optimizeStartup
};
