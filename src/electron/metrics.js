
const si = require('systeminformation');
const { ipcMain } = require('electron');
const log = require('electron-log');

// Глобальные переменные для метрик
let prevNetworkStats = null;
let metricsUpdateInterval = null;
let metricsBeforeOptimization = null;

// Сбор начальных метрик для сравнения до и после
async function collectInitialMetrics() {
  try {
    const [cpuData, memData, tempData, networkData] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.cpuTemperature(),
      si.networkStats()
    ]);
    
    metricsBeforeOptimization = {
      cpu: cpuData.currentLoad,
      memory: (memData.used / memData.total) * 100,
      temperature: tempData.main || tempData.cores?.[0] || 0,
      networkSpeed: networkData && networkData.length > 0 ? 
        Math.round((networkData[0].rx_sec + networkData[0].tx_sec) / 125000) : 0,
      timestamp: Date.now()
    };
    
    log.info('Начальные метрики собраны:', metricsBeforeOptimization);
    
  } catch (error) {
    log.error('Ошибка при сборе начальных метрик:', error);
  }
}

// Запуск сбора метрик
function startMetricsCollection(mainWindow) {
  if (metricsUpdateInterval) {
    clearInterval(metricsUpdateInterval);
  }
  
  // Обновляем метрики каждые 2 секунды
  metricsUpdateInterval = setInterval(async () => {
    if (!mainWindow) return;
    
    try {
      const cpuData = await si.currentLoad();
      const memData = await si.mem();
      const tempData = await si.cpuTemperature();
      const networkData = await si.networkStats();
      
      // Рассчитываем сетевую скорость
      let networkSpeed = 0;
      if (networkData && networkData.length > 0) {
        const totalRx = networkData.reduce((sum, iface) => sum + iface.rx_sec, 0);
        const totalTx = networkData.reduce((sum, iface) => sum + iface.tx_sec, 0);
        networkSpeed = Math.round((totalRx + totalTx) / 125000); // Конвертация в Мбит/с
      }
      
      // Отправляем метрики в рендер-процесс
      if (mainWindow) {
        mainWindow.webContents.send('system-metrics', {
          cpu: cpuData.currentLoad.toFixed(1),
          memory: ((memData.used / memData.total) * 100).toFixed(1),
          temperature: (tempData.main || tempData.cores?.[0] || 0).toFixed(1),
          networkSpeed: networkSpeed.toString(),
          timestamp: Date.now()
        });
      }
    } catch (error) {
      log.error('Error collecting metrics:', error);
    }
  }, 2000);
}

function stopMetricsCollection() {
  if (metricsUpdateInterval) {
    clearInterval(metricsUpdateInterval);
    metricsUpdateInterval = null;
  }
}

// Настройка обработчиков для получения системных метрик
function setupMetricHandlers() {
  ipcMain.handle('get-cpu-usage', async () => {
    try {
      const cpuData = await si.currentLoad();
      return cpuData.currentLoad;
    } catch (error) {
      log.error('Error getting CPU usage:', error);
      return 0;
    }
  });
  
  ipcMain.handle('get-memory-usage', async () => {
    try {
      const memData = await si.mem();
      return (memData.used / memData.total) * 100;
    } catch (error) {
      log.error('Error getting memory usage:', error);
      return 0;
    }
  });
  
  ipcMain.handle('get-temperature', async () => {
    try {
      const tempData = await si.cpuTemperature();
      return tempData.main || tempData.cores?.[0] || 0;
    } catch (error) {
      log.error('Error getting CPU temperature:', error);
      return 0;
    }
  });
  
  ipcMain.handle('get-network-speed', async () => {
    try {
      const currentNetworkStats = await si.networkStats();
      
      if (currentNetworkStats && currentNetworkStats.length > 0) {
        // Считаем общую скорость по всем интерфейсам
        let totalRxSec = 0;
        let totalTxSec = 0;
        
        for (const iface of currentNetworkStats) {
          totalRxSec += iface.rx_sec || 0;
          totalTxSec += iface.tx_sec || 0;
        }
        
        // Расчет скорости в Мбит/с
        return Math.round((totalRxSec + totalTxSec) / 125000);
      }
      return 0;
    } catch (error) {
      log.error('Error getting network speed:', error);
      return 0;
    }
  });
}

// Собираем метрики после оптимизации для сравнения
async function collectMetricsAfterOptimization() {
  try {
    const [cpuData, memData, tempData, networkData] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.cpuTemperature(),
      si.networkStats()
    ]);
    
    const metricsAfterOptimization = {
      cpu: cpuData.currentLoad,
      memory: (memData.used / memData.total) * 100,
      temperature: tempData.main || tempData.cores?.[0] || 0,
      networkSpeed: networkData && networkData.length > 0 ? 
        Math.round((networkData[0].rx_sec + networkData[0].tx_sec) / 125000) : 0,
      timestamp: Date.now()
    };
    
    // Вычисляем улучшения если есть начальные метрики
    if (metricsBeforeOptimization) {
      const improvements = {
        cpu: ((metricsBeforeOptimization.cpu - metricsAfterOptimization.cpu) / metricsBeforeOptimization.cpu * 100).toFixed(1),
        memory: ((metricsBeforeOptimization.memory - metricsAfterOptimization.memory) / metricsBeforeOptimization.memory * 100).toFixed(1),
        temperature: ((metricsBeforeOptimization.temperature - metricsAfterOptimization.temperature) / metricsBeforeOptimization.temperature * 100).toFixed(1),
      };
      
      log.info('Performance improvements:', improvements);
      return improvements;
    }
    
    return null;
  } catch (error) {
    log.error('Error collecting metrics after optimization:', error);
    return null;
  }
}

// Инициализация сбора метрик
function initMetrics() {
  setupMetricHandlers();
}

module.exports = {
  startMetricsCollection,
  stopMetricsCollection,
  collectInitialMetrics,
  collectMetricsAfterOptimization,
  initMetrics,
  getBeforeOptimizationMetrics: () => metricsBeforeOptimization
};
