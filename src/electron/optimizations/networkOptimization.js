
const { runPowerShellCommand } = require('../utils/commandUtils');
const log = require('electron-log');

// Оптимизация сетевых настроек
async function optimizeNetworkSettings() {
  try {
    // Отключение автотюнинга TCP для улучшения стабильности соединения
    await runPowerShellCommand('netsh int tcp set global autotuninglevel=disabled');
    
    // Оптимизация DNS для улучшения отклика
    await runPowerShellCommand('netsh int ip set dns "Ethernet" static 8.8.8.8 primary');
    await runPowerShellCommand('netsh int ip add dns "Ethernet" 8.8.4.4 index=2');
    
    // Сброс настроек Winsock для исправления проблем с сетью
    await runPowerShellCommand('netsh winsock reset');
    
    // Оптимизация QoS для игр и приложений
    await runPowerShellCommand('netsh int tcp set global ecncapability=disabled');
    
    return true;
  } catch (error) {
    log.error('Error optimizing network:', error);
    return false;
  }
}

module.exports = {
  optimizeNetworkSettings
};
