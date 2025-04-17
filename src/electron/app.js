
const { app, ipcMain } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const { initMetrics } = require('./metrics');
const { setupOptimizationHandlers } = require('./optimization');
const { createWindow, setupWindowEvents } = require('./window');
const { createTray } = require('./tray');
const { setAutostart } = require('./autostart');
const { isAdmin, restartAsAdmin, showLogs } = require('./utils');
const { checkForUpdates, setupUpdaterHandlers } = require('./updater');

// Настройка логирования
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('Приложение запущено:', new Date().toISOString());

// Глобальные переменные
const isQuitting = { value: false };

// Информация о приложении
const appInfo = {
  name: 'Windows Optimizer Pro',
  version: app.getVersion(),
  author: 'Kyrlan Alexandr',
  sponsor: 'MyArredo',
  copyright: '©2025 Все права защищены'
};

// Инициализация приложения
app.whenReady().then(() => {
  // Создаем главное окно
  const mainWindow = createWindow();
  
  // Настраиваем события окна
  setupWindowEvents(isQuitting);
  
  // Создаем системный трей
  createTray(appInfo, isQuitting, app);
  
  // Настраиваем обработчики автообновления
  setupUpdaterHandlers();
  
  // Инициализируем модуль сбора метрик
  initMetrics();
  
  // Настраиваем обработчики оптимизации
  setupOptimizationHandlers(mainWindow, isAdmin, restartAsAdmin);
  
  // Настраиваем обработчики IPC
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('show-logs', showLogs);
  ipcMain.handle('set-autostart', (_, enabled) => setAutostart(enabled));
  ipcMain.handle('check-for-updates', checkForUpdates);
  
  // Проверяем обновления (только если не в режиме разработки)
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdatesAndNotify();
  }
  
  app.on('activate', function () {
    if (!mainWindow) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    isQuitting.value = true;
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting.value = true;
});

// Экспортируем функции для доступа из других модулей
module.exports = {
  app,
  isAdmin,
  restartAsAdmin
};
