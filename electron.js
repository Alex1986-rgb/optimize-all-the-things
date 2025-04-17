
// Главный файл Electron (точка входа)
// Импортируем основные модули
const { app } = require('electron');
const { initMetrics } = require('./src/electron/metrics');
const appModule = require('./src/electron/app');

// Инициализация приложения
app.whenReady().then(() => {
  // Инициализируем модуль сбора метрик
  initMetrics();
});

// Экспорт для доступа в других частях приложения
module.exports = {
  app
};
