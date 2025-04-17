
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const si = require('systeminformation');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// Обработчики для получения системных метрик
ipcMain.handle('get-cpu-usage', async () => {
  try {
    const cpuData = await si.currentLoad();
    return cpuData.currentLoad;
  } catch (error) {
    console.error('Error getting CPU usage:', error);
    return 0;
  }
});

ipcMain.handle('get-memory-usage', async () => {
  try {
    const memData = await si.mem();
    return (memData.used / memData.total) * 100;
  } catch (error) {
    console.error('Error getting memory usage:', error);
    return 0;
  }
});

ipcMain.handle('get-temperature', async () => {
  try {
    const tempData = await si.cpuTemperature();
    return tempData.main || 0;
  } catch (error) {
    console.error('Error getting CPU temperature:', error);
    return 0;
  }
});

ipcMain.handle('get-network-speed', async () => {
  try {
    const netData = await si.networkStats();
    // Берем первый сетевой интерфейс и возвращаем скорость в Мбит/с
    if (netData && netData.length > 0) {
      return Math.round(netData[0].tx_sec / 125000); // Конвертация из байт/с в Мбит/с
    }
    return 0;
  } catch (error) {
    console.error('Error getting network speed:', error);
    return 0;
  }
});

ipcMain.handle('run-optimization', async (event, settings) => {
  // Здесь будет реализация выполнения реальных команд оптимизации
  console.log('Running optimization with settings:', settings);
  
  // Пример выполнения системной команды через PowerShell
  // const PowerShell = require('node-powershell');
  // const ps = new PowerShell();
  
  // try {
  //   if (settings.cleanup) {
  //     await ps.addCommand('Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue');
  //     await ps.invoke();
  //   }
  // } catch (error) {
  //   console.error('Error during optimization:', error);
  // } finally {
  //   ps.dispose();
  // }
  
  return { success: true, message: 'Оптимизация успешно выполнена' };
});
