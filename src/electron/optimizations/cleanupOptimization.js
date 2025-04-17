
const { runPowerShellCommand } = require('../utils/commandUtils');
const log = require('electron-log');

// Очистка временных файлов
async function cleanupTemporaryFiles() {
  try {
    await runPowerShellCommand('Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Remove-Item "$env:LOCALAPPDATA\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue');
    return true;
  } catch (error) {
    log.error('Error cleaning temp files:', error);
    return false;
  }
}

module.exports = {
  cleanupTemporaryFiles
};
