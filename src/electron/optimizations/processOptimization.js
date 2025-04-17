
const { runPowerShellCommand } = require('../utils/commandUtils');
const log = require('electron-log');

// Настройка приоритетов процессов
async function optimizeProcessPriorities() {
  try {
    // Устанавливаем высокий приоритет для активных процессов
    await runPowerShellCommand(`
      $currentProcess = Get-Process -Id $PID
      $currentProcess.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
    `);
    
    // Устанавливаем более низкий приоритет для фоновых служб
    await runPowerShellCommand('wmic process where name="svchost.exe" CALL setpriority "below normal"');
    
    return true;
  } catch (error) {
    log.error('Error setting process priorities:', error);
    return false;
  }
}

module.exports = {
  optimizeProcessPriorities
};
