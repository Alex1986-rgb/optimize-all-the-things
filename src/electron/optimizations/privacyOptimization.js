
const { runPowerShellCommand } = require('../utils/commandUtils');
const log = require('electron-log');

// Настройки конфиденциальности
async function applyPrivacySettings() {
  try {
    // Отключение телеметрии и сбора данных
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f');
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableTailoredExperiencesWithDiagnosticData /t REG_DWORD /d 1 /f');
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" /v DisabledByGroupPolicy /t REG_DWORD /d 1 /f');
    
    // Отключение отслеживания запусков программ
    await runPowerShellCommand('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_TrackProgs /t REG_DWORD /d 0 /f');
    
    return true;
  } catch (error) {
    log.error('Error applying privacy settings:', error);
    return false;
  }
}

module.exports = {
  applyPrivacySettings
};
