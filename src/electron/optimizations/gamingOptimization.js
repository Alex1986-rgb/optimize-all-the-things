
const { runPowerShellCommand } = require('../utils/commandUtils');
const log = require('electron-log');

// Игровой режим
async function enableGamingMode() {
  try {
    // Оптимизации для игр
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f');
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f');
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Priority" /t REG_DWORD /d 6 /f');
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d "High" /f');
    
    // Установка высокопроизводительного плана электропитания
    await runPowerShellCommand('powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c');
    
    // Отключение динамических тиков таймера
    await runPowerShellCommand('bcdedit /set disabledynamictick yes');
    
    return true;
  } catch (error) {
    log.error('Error enabling gaming mode:', error);
    return false;
  }
}

module.exports = {
  enableGamingMode
};
