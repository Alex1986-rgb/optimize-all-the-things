
const { contextBridge, ipcRenderer } = require('electron');

// Экспортируем API в глобальный объект window
contextBridge.exposeInMainWorld('electronAPI', {
  // Методы для получения системных метрик
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  getTemperature: () => ipcRenderer.invoke('get-temperature'),
  getNetworkSpeed: () => ipcRenderer.invoke('get-network-speed'),
  
  // Метод для запуска оптимизации
  runOptimization: (settings) => ipcRenderer.invoke('run-optimization', settings),
  
  // Обработчики событий
  onSystemMetrics: (callback) => {
    ipcRenderer.on('system-metrics', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('system-metrics');
  },
  
  onAdminRightsWarning: (callback) => {
    ipcRenderer.on('admin-rights-warning', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('admin-rights-warning');
  }
});
