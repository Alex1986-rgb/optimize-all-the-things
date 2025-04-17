
const { app, BrowserWindow, ipcMain, Menu, Tray, shell } = require('electron');
const path = require('path');
const url = require('url');
const si = require('systeminformation');
const { exec } = require('child_process');
const fs = require('fs');
const log = require('electron-log');

// Настройка логирования
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Глобальные переменные
let mainWindow;
let tray = null;
let isQuitting = false;
let prevNetworkStats = null;
let metricsUpdateInterval = null;

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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public/favicon.ico'),
    show: false // Не показываем окно пока оно не будет готово
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Показываем окно когда оно полностью загрузится
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Уведомление, если запущено без прав администратора
    if (!hasAdminRights) {
      mainWindow.webContents.send('admin-rights-warning', {
        message: 'Приложение запущено без прав администратора. Некоторые функции могут не работать.'
      });
    }
  });

  // Открыть DevTools в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Запуск сбора метрик при старте
  startMetricsCollection();

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

// Создаем системный трей
function createTray() {
  tray = new Tray(path.join(__dirname, 'public/favicon.ico'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Открыть Windows Optimizer', click: () => mainWindow.show() },
    { label: 'Проверить обновления', click: checkForUpdates },
    { type: 'separator' },
    { label: 'Выход', click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Windows Optimizer');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.show();
  });
}

// Запуск сбора метрик
function startMetricsCollection() {
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
      if (prevNetworkStats && networkData && networkData.length > 0) {
        const totalRx = networkData.reduce((sum, iface) => sum + iface.rx_sec, 0);
        const totalTx = networkData.reduce((sum, iface) => sum + iface.tx_sec, 0);
        networkSpeed = Math.round((totalRx + totalTx) / 125000); // Конвертация в Мбит/с
      }
      prevNetworkStats = networkData;
      
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

// Проверка обновлений
function checkForUpdates() {
  // Здесь можно реализовать проверку обновлений
  // Например, через GitHub API
  shell.openExternal('https://github.com/yourusername/windows-optimizer/releases');
}

// Инициализация приложения
app.whenReady().then(() => {
  createWindow();
  createTray();
  
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

// Обработчики для получения системных метрик
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
    
    if (!prevNetworkStats) {
      prevNetworkStats = currentNetworkStats;
      return 0;
    }
    
    if (currentNetworkStats && currentNetworkStats.length > 0) {
      // Считаем общую скорость по всем интерфейсам
      let totalRxSec = 0;
      let totalTxSec = 0;
      
      for (const iface of currentNetworkStats) {
        totalRxSec += iface.rx_sec || 0;
        totalTxSec += iface.tx_sec || 0;
      }
      
      // Расчет скорости в Мбит/с
      const speedMbps = Math.round((totalRxSec + totalTxSec) / 125000);
      
      // Обновляем предыдущие значения
      prevNetworkStats = currentNetworkStats;
      
      return speedMbps;
    }
    return 0;
  } catch (error) {
    log.error('Error getting network speed:', error);
    return 0;
  }
});

// Функция для выполнения PowerShell команды с повышенными привилегиями
async function runPowerShellCommand(command) {
  return new Promise((resolve, reject) => {
    const powershellCommand = `powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command ${command.replace(/"/g, '\\"')}'"`;
    
    exec(powershellCommand, (error, stdout, stderr) => {
      if (error) {
        log.error(`PowerShell error: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        log.warn(`PowerShell stderr: ${stderr}`);
      }
      log.info(`PowerShell command executed: ${command}`);
      log.info(`PowerShell stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Обработчик для выполнения оптимизаций
ipcMain.handle('run-optimization', async (event, settings) => {
  log.info('Running optimization with settings:', settings);
  
  // Проверяем наличие прав администратора
  if (!isAdmin()) {
    log.warn('Attempting to run optimizations without admin rights');
    return {
      success: false,
      message: 'Для выполнения оптимизаций требуются права администратора. Пожалуйста, перезапустите приложение от имени администратора.'
    };
  }
  
  try {
    const results = [];
    
    // Очистка временных файлов
    if (settings.cleanup) {
      try {
        await runPowerShellCommand('Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue');
        results.push('Временные файлы успешно очищены');
      } catch (error) {
        log.error('Error cleaning temp files:', error);
        results.push(`Ошибка при очистке временных файлов: ${error.message}`);
      }
    }
    
    // Оптимизация сетевых настроек
    if (settings.network) {
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
        
        results.push('Сетевые настройки успешно оптимизированы');
      } catch (error) {
        log.error('Error optimizing network:', error);
        results.push(`Ошибка при оптимизации сети: ${error.message}`);
      }
    }
    
    // Отключение фоновых процессов браузеров
    if (settings.browsers) {
      try {
        await runPowerShellCommand('Get-Process chrome* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Get-Process msedge* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Get-Process firefox* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
        
        // Отключение автозапуска браузеров
        await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Chrome" -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Microsoft Edge" -ErrorAction SilentlyContinue');
        
        results.push('Фоновые процессы браузеров успешно остановлены');
      } catch (error) {
        log.error('Error stopping browser processes:', error);
        results.push(`Ошибка при остановке процессов браузеров: ${error.message}`);
      }
    }
    
    // Отключение неиспользуемых служб
    if (settings.services) {
      try {
        // Список неиспользуемых или ресурсоемких служб
        const servicesToDisable = [
          'DiagTrack',          // Телеметрия Windows
          'dmwappushservice',   // WAP Push Message Routing Service
          'MapsBroker',         // Служба загрузки карт
          'wuauserv',           // Центр обновления Windows
          'WSearch',            // Поиск Windows
          'SysMain',            // Superfetch
          'TabletInputService'  // Служба панели рукописного ввода
        ];
        
        for (const service of servicesToDisable) {
          await runPowerShellCommand(`Stop-Service -Name "${service}" -Force -ErrorAction SilentlyContinue`);
          await runPowerShellCommand(`Set-Service -Name "${service}" -StartupType Disabled -ErrorAction SilentlyContinue`);
        }
        
        results.push('Неиспользуемые службы успешно отключены');
      } catch (error) {
        log.error('Error disabling services:', error);
        results.push(`Ошибка при отключении служб: ${error.message}`);
      }
    }
    
    // Настройка приоритетов процессов
    if (settings.priority) {
      try {
        // Устанавливаем высокий приоритет для активных процессов
        await runPowerShellCommand(`
          $currentProcess = Get-Process -Id $PID
          $currentProcess.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
        `);
        
        results.push('Приоритеты процессов успешно настроены');
      } catch (error) {
        log.error('Error setting process priorities:', error);
        results.push(`Ошибка при настройке приоритетов: ${error.message}`);
      }
    }
    
    return { 
      success: true, 
      message: 'Оптимизация успешно выполнена. ' + results.join('. ')
    };
    
  } catch (error) {
    log.error('Error during optimization:', error);
    return { 
      success: false, 
      message: `Произошла ошибка при оптимизации: ${error.message}` 
    };
  }
});
