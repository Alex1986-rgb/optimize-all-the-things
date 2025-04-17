
const { app, BrowserWindow, ipcMain, Menu, Tray, shell, dialog } = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const { exec } = require('child_process');
const fs = require('fs');
const { startMetricsCollection, stopMetricsCollection, collectInitialMetrics } = require('./metrics');
const { setupOptimizationHandlers } = require('./optimization');

// Настройка логирования
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('Приложение запущено:', new Date().toISOString());

// Глобальные переменные
let mainWindow;
let tray = null;
let isQuitting = false;

// Информация о приложении
const appInfo = {
  name: 'Windows Optimizer Pro',
  version: '1.2.3',
  author: 'Kyrlan Alexandr',
  sponsor: 'MyArredo',
  copyright: '©2025 Все права защищены'
};

// Проверка на запуск с админ правами
const isAdmin = () => {
  try {
    fs.accessSync('C:\\Windows\\system32\\config', fs.constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function createWindow() {
  // Проверяем админ права при запуске
  const hasAdminRights = isAdmin();
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    show: false, // Не показываем окно пока оно не будет готово
    backgroundColor: '#111827' // Темный фон для плавной загрузки
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
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
  });

  // Открыть DevTools в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Запуск сбора метрик при старте
  startMetricsCollection(mainWindow);

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
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

// Перезапуск приложения с правами администратора
function restartAsAdmin() {
  const appPath = app.getPath('exe');
  
  exec(`powershell -Command "Start-Process -Verb RunAs '${appPath}'"`, (error) => {
    if (error) {
      log.error('Ошибка перезапуска с правами администратора:', error);
      return;
    }
    isQuitting = true;
    app.quit();
  });
}

// Создаем системный трей
function createTray() {
  tray = new Tray(path.join(__dirname, '../public/favicon.ico'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: `${appInfo.name} v${appInfo.version}`, enabled: false },
    { type: 'separator' },
    { label: 'Открыть Windows Optimizer', click: () => mainWindow.show() },
    { label: 'Проверить обновления', click: checkForUpdates },
    { label: 'Показать журнал', click: showLogs },
    { type: 'separator' },
    { label: 'Перезапустить от имени администратора', click: restartAsAdmin },
    { label: 'Выход', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip(`${appInfo.name} v${appInfo.version}`);
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.show();
  });
}

// Показать файл логов
function showLogs() {
  const logFilePath = log.transports.file.getFile().path;
  shell.showItemInFolder(logFilePath);
}

// Проверка обновлений
function checkForUpdates() {
  dialog.showMessageBox({
    type: 'info',
    title: 'Обновления',
    message: 'Проверка обновлений',
    detail: 'Ваша версия программы актуальна.\nWindows Optimizer Pro v' + appInfo.version,
    buttons: ['OK']
  });
}

// Инициализация приложения
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Настраиваем обработчики оптимизации
  setupOptimizationHandlers(mainWindow, isAdmin, restartAsAdmin);
  
  app.on('activate', function () {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    isQuitting = true;
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopMetricsCollection();
});

// Экспортируем функции для доступа из других модулей
module.exports = {
  isAdmin,
  restartAsAdmin
};
