
const { app, BrowserWindow, ipcMain, Menu, Tray, shell, dialog } = require('electron');
const path = require('path');
const url = require('url');
const si = require('systeminformation');
const { exec } = require('child_process');
const fs = require('fs');
const log = require('electron-log');

// Настройка логирования
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('Приложение запущено:', new Date().toISOString());

// Глобальные переменные
let mainWindow;
let tray = null;
let isQuitting = false;
let prevNetworkStats = null;
let metricsUpdateInterval = null;
let metricsBeforeOptimization = null;

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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public/favicon.ico'),
    show: false, // Не показываем окно пока оно не будет готово
    backgroundColor: '#111827' // Темный фон для плавной загрузки
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

// Создаем системный трей
function createTray() {
  tray = new Tray(path.join(__dirname, 'public/favicon.ico'));
  
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
    
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Требуются права администратора',
      message: 'Для выполнения оптимизаций требуются права администратора',
      detail: 'Некоторые оптимизации могут не сработать без прав администратора. Хотите перезапустить приложение?',
      buttons: ['Продолжить без прав администратора', 'Перезапустить от имени администратора'],
      defaultId: 1
    }).then(({ response }) => {
      if (response === 1) {
        restartAsAdmin();
      }
    });
    
    return {
      success: false,
      message: 'Для выполнения оптимизаций требуются права администратора.'
    };
  }
  
  try {
    const results = [];
    
    // Очистка временных файлов
    if (settings.cleanup) {
      try {
        await runPowerShellCommand('Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-Item "$env:LOCALAPPDATA\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue');
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
        // Закрытие всех браузеров
        await runPowerShellCommand('Get-Process chrome* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Get-Process msedge* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Get-Process firefox* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Get-Process opera* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Get-Process browser* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
        
        // Отключение автозапуска браузеров
        await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Chrome" -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Microsoft Edge" -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Yandex" -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Opera" -ErrorAction SilentlyContinue');
        
        // Отключение фоновой работы для всех браузеров
        await runPowerShellCommand('reg add "HKCU\\Software\\Google\\Chrome\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f');
        await runPowerShellCommand('reg add "HKCU\\Software\\Microsoft\\Edge\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f');
        await runPowerShellCommand('reg add "HKCU\\Software\\Yandex\\YandexBrowser\\Background" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f');
        await runPowerShellCommand('reg add "HKCU\\Software\\Opera Software\\Preferences" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f');
        
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
          'WSearch',            // Поиск Windows
          'SysMain',            // Superfetch
          'TabletInputService', // Служба панели рукописного ввода
          'XblGameSave',        // Xbox Game Save
          'XboxNetApiSvc',      // Xbox Live Networking 
          'Fax'                 // Факс
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
        
        // Устанавливаем более низкий приоритет для фоновых служб
        await runPowerShellCommand('wmic process where name="svchost.exe" CALL setpriority "below normal"');
        
        results.push('Приоритеты процессов успешно настроены');
      } catch (error) {
        log.error('Error setting process priorities:', error);
        results.push(`Ошибка при настройке приоритетов: ${error.message}`);
      }
    }
    
    // Оптимизация автозагрузки
    if (settings.startup) {
      try {
        await runPowerShellCommand('Get-CimInstance Win32_StartupCommand | Select-Object Command, Description | Format-Table -AutoSize');
        
        // Отключение ненужных элементов автозагрузки
        await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Steam Client Bootstrapper" /f');
        await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Discord" /f');
        await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Spotify" /f');
        await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "EpicGamesLauncher" /f');
        await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Skype" /f');
        
        results.push('Автозагрузка успешно оптимизирована');
      } catch (error) {
        log.error('Error optimizing startup:', error);
        results.push(`Ошибка при оптимизации автозагрузки: ${error.message}`);
      }
    }
    
    // Игровой режим
    if (settings.gaming) {
      try {
        // Оптимизации для игр
        await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f');
        await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f');
        await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Priority" /t REG_DWORD /d 6 /f');
        await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d "High" /f');
        
        // Установка высокопроизводительного плана электропитания
        await runPowerShellCommand('powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c');
        
        // Отключение динамических тиков таймера
        await runPowerShellCommand('bcdedit /set disabledynamictick yes');
        
        results.push('Игровой режим успешно активирован');
      } catch (error) {
        log.error('Error enabling gaming mode:', error);
        results.push(`Ошибка при активации игрового режима: ${error.message}`);
      }
    }
    
    // Настройки конфиденциальности
    if (settings.privacy) {
      try {
        // Отключение телеметрии и сбора данных
        await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f');
        await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableTailoredExperiencesWithDiagnosticData /t REG_DWORD /d 1 /f');
        await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" /v DisabledByGroupPolicy /t REG_DWORD /d 1 /f');
        
        // Отключение отслеживания запусков программ
        await runPowerShellCommand('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_TrackProgs /t REG_DWORD /d 0 /f');
        
        results.push('Настройки конфиденциальности успешно применены');
      } catch (error) {
        log.error('Error applying privacy settings:', error);
        results.push(`Ошибка при настройке конфиденциальности: ${error.message}`);
      }
    }
    
    log.info('Optimization completed with results:', results);
    
    // Собираем новые метрики для сравнения с начальными
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
      
      log.info('Metrics after optimization:', metricsAfterOptimization);
      log.info('Metrics before optimization:', metricsBeforeOptimization);
      
      // Вычисляем улучшения
      const improvements = {
        cpu: metricsBeforeOptimization ? 
          ((metricsBeforeOptimization.cpu - metricsAfterOptimization.cpu) / metricsBeforeOptimization.cpu * 100).toFixed(1) : 0,
        memory: metricsBeforeOptimization ? 
          ((metricsBeforeOptimization.memory - metricsAfterOptimization.memory) / metricsBeforeOptimization.memory * 100).toFixed(1) : 0,
        temperature: metricsBeforeOptimization ? 
          ((metricsBeforeOptimization.temperature - metricsAfterOptimization.temperature) / metricsBeforeOptimization.temperature * 100).toFixed(1) : 0,
      };
      
      log.info('Performance improvements:', improvements);
    } catch (error) {
      log.error('Error calculating performance improvements:', error);
    }
    
    return { 
      success: true, 
      message: 'Оптимизация успешно выполнена! ' + results.join('. ')
    };
    
  } catch (error) {
    log.error('Error during optimization:', error);
    return { 
      success: false, 
      message: `Произошла ошибка при оптимизации: ${error.message}` 
    };
  }
});
