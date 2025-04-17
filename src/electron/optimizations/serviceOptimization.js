
const { runPowerShellCommand } = require('../utils/commandUtils');
const log = require('electron-log');

// Отключение неиспользуемых служб
async function disableUnnecessaryServices() {
  try {
    // Список неиспользуемых или ресурсоемких служб
    const servicesToDisable = [
      'DiagTrack',          // Телеметрия Windows
      'dmwappushservice',   // WAP Push Message Routing Service
      'MapsBroker',         // Служба загрузки карт
      'WSearch',            // Поиск Windows
      'SysMain',            // Superfetch
      'TabletInputService', // Служба панели рукописного ввода
      'XblGameSave',        // Xbox Game Save
      'XboxNetApiSvc',      // Xbox Live Networking 
      'Fax'                 // Факс
    ];
    
    for (const service of servicesToDisable) {
      await runPowerShellCommand(`Stop-Service -Name "${service}" -Force -ErrorAction SilentlyContinue`);
      await runPowerShellCommand(`Set-Service -Name "${service}" -StartupType Disabled -ErrorAction SilentlyContinue`);
    }
    
    return true;
  } catch (error) {
    log.error('Error disabling services:', error);
    return false;
  }
}

module.exports = {
  disableUnnecessaryServices
};
