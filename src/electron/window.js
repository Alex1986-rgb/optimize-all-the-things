
const { BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const { isAdmin, restartAsAdmin } = require('./utils');
const { collectInitialMetrics, startMetricsCollection, stopMetricsCollection } = require('./metrics');

let mainWindow;

function createWindow() {
  // Проверяем админ права при запуске
  const hasAdminRights = isAdmin();
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../../preload.js')
    },
    icon: path.join(__dirname, '../../resources/icon.ico'),
    show: false, // Не показываем окно пока оно не будет готово
    backgroundColor: '#111827' // Темный фон для плавной загрузки
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Показываем окно когда оно полностью загрузится
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Сбор начальных метрик
    collectInitialMetrics();
    
    // Уведомление, если запущено без прав администратора
    if (!hasAdminRights) {
      showAdminRightsWarning();
    }
  });

  // Открыть DevTools в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Запуск сбора метрик при старте
  startMetricsCollection(mainWindow);

  return mainWindow;
}

function showAdminRightsWarning() {
  dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'Запуск без прав администратора',
    message: 'Приложение запущено без прав администратора. Некоторые функции оптимизации могут не работать. Рекомендуется перезапустить приложение от имени администратора.',
    buttons: ['Продолжить', 'Перезапустить от администратора'],
    defaultId: 1
  }).then(({ response }) => {
    if (response === 1) {
      restartAsAdmin();
    }
  });
}

function setupWindowEvents(isQuitting) {
  mainWindow.on('close', (event) => {
    if (!isQuitting.value) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
    
    stopMetricsCollection();
    return true;
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function getMainWindow() {
  return mainWindow;
}

module.exports = {
  createWindow,
  setupWindowEvents,
  getMainWindow
};
