
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const si = require('systeminformation');
const { exec } = require('child_process');
const fs = require('fs');

// Установка для хранения предыдущих значений сетевой статистики
let prevNetworkStats = null;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public/favicon.ico')
  });

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Открыть DevTools в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

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
    return tempData.main || tempData.cores?.[0] || 0;
  } catch (error) {
    console.error('Error getting CPU temperature:', error);
    return 0;
  }
});

ipcMain.handle('get-network-speed', async () => {
  try {
    const currentNetworkStats = await si.networkStats();
    
    // Если это первый запрос, сохраняем данные и возвращаем 0
    if (!prevNetworkStats) {
      prevNetworkStats = currentNetworkStats;
      return 0;
    }
    
    // Берем первый сетевой интерфейс и рассчитываем скорость
    if (currentNetworkStats && currentNetworkStats.length > 0 && 
        prevNetworkStats && prevNetworkStats.length > 0) {
      
      // Расчет скорости в Мбит/с (используем tx_sec для исходящей скорости)
      const speedMbps = Math.round((currentNetworkStats[0].tx_sec + currentNetworkStats[0].rx_sec) / 125000);
      
      // Обновляем предыдущие значения
      prevNetworkStats = currentNetworkStats;
      
      return speedMbps;
    }
    return 0;
  } catch (error) {
    console.error('Error getting network speed:', error);
    return 0;
  }
});

// Функция для запуска PowerShell команды
async function runPowerShellCommand(command) {
  return new Promise((resolve, reject) => {
    exec(`powershell -Command "${command}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`PowerShell error: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`PowerShell stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

ipcMain.handle('run-optimization', async (event, settings) => {
  console.log('Running optimization with settings:', settings);
  
  try {
    const results = [];
    
    // Очистка временных файлов
    if (settings.cleanup) {
      try {
        await runPowerShellCommand('Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue');
        results.push('Временные файлы успешно очищены');
      } catch (error) {
        results.push(`Ошибка при очистке временных файлов: ${error.message}`);
      }
    }
    
    // Оптимизация сетевых настроек
    if (settings.network) {
      try {
        // Отключение автотюнинга TCP
        await runPowerShellCommand('netsh int tcp set global autotuninglevel=disabled');
        // Установка оптимальных параметров для DNS
        await runPowerShellCommand('netsh int ip set dns "Ethernet" static 8.8.8.8');
        // Сброс настроек Winsock
        await runPowerShellCommand('netsh winsock reset');
        
        results.push('Сетевые настройки оптимизированы');
      } catch (error) {
        results.push(`Ошибка при оптимизации сети: ${error.message}`);
      }
    }
    
    // Отключение фоновых процессов браузеров
    if (settings.browsers) {
      try {
        await runPowerShellCommand('Get-Process chrome* | Stop-Process -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Get-Process msedge* | Stop-Process -Force -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Get-Process firefox* | Stop-Process -Force -ErrorAction SilentlyContinue');
        
        // Отключение автозапуска браузеров
        await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Chrome" -ErrorAction SilentlyContinue');
        await runPowerShellCommand('Remove-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Microsoft Edge" -ErrorAction SilentlyContinue');
        
        results.push('Фоновые процессы браузеров остановлены');
      } catch (error) {
        results.push(`Ошибка при остановке процессов браузеров: ${error.message}`);
      }
    }
    
    // Отключение неиспользуемых служб
    if (settings.services) {
      try {
        // Список служб для остановки (можно настроить в зависимости от потребностей)
        const servicesToDisable = [
          'DiagTrack',          // Телеметрия Windows
          'wuauserv',          // Центр обновления Windows
          'WSearch',           // Поиск Windows
          'SysMain',           // Ранее известная как Superfetch
          'TabletInputService' // Служба панели рукописного ввода для планшетов
        ];
        
        for (const service of servicesToDisable) {
          await runPowerShellCommand(`Stop-Service -Name "${service}" -Force -ErrorAction SilentlyContinue`);
          await runPowerShellCommand(`Set-Service -Name "${service}" -StartupType Disabled -ErrorAction SilentlyContinue`);
        }
        
        results.push('Неиспользуемые службы отключены');
      } catch (error) {
        results.push(`Ошибка при отключении служб: ${error.message}`);
      }
    }
    
    // Очистка кэша DNS
    if (settings.network) {
      try {
        await runPowerShellCommand('ipconfig /flushdns');
        results.push('Кэш DNS очищен');
      } catch (error) {
        results.push(`Ошибка при очистке кэша DNS: ${error.message}`);
      }
    }
    
    return { 
      success: true, 
      message: 'Оптимизация успешно выполнена. ' + results.join('. ')
    };
    
  } catch (error) {
    console.error('Error during optimization:', error);
    return { 
      success: false, 
      message: `Произошла ошибка: ${error.message}` 
    };
  }
});
