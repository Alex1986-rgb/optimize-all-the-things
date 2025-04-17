
const { contextBridge, ipcRenderer } = require('electron');

// Экспортируем API в глобальный объект window
contextBridge.exposeInMainWorld('electronAPI', {
  // Методы для получения системных метрик
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
  getTemperature: () => ipcRenderer.invoke('get-temperature'),
  getNetworkSpeed: () => ipcRenderer.invoke('get-network-speed'),
  
  // Метод для запуска оптимизации
  runOptimization: (settings) => ipcRenderer.invoke('run-optimization', settings)
});
