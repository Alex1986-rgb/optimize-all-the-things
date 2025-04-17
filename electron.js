
// Главный файл Electron (точка входа)
const { app } = require('electron');
const { initMetrics } = require('./src/electron/metrics');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Настраиваем логирование для автообновления
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Инициализация приложения
app.whenReady().then(() => {
  // Инициализируем модуль сбора метрик
  initMetrics();
  
  // Проверяем обновления (только если не в режиме разработки)
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// Импортируем остальные функции из основного модуля приложения
const appModule = require('./src/electron/app');

// Экспорт для доступа в других частях приложения
module.exports = {
  app
};
