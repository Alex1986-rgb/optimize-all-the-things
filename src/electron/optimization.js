
const { ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const log = require('electron-log');
const { collectMetricsAfterOptimization } = require('./metrics');

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

// Очистка временных файлов
async function cleanupTemporaryFiles() {
  try {
    await runPowerShellCommand('Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Remove-Item "$env:LOCALAPPDATA\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue');
    return true;
  } catch (error) {
    log.error('Error cleaning temp files:', error);
    return false;
  }
}

// Оптимизация сетевых настроек
async function optimizeNetworkSettings() {
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
    
    return true;
  } catch (error) {
    log.error('Error optimizing network:', error);
    return false;
  }
}

// Отключение фоновых процессов браузеров
async function stopBrowserBackgroundProcesses() {
  try {
    // Закрытие всех браузеров
    await runPowerShellCommand('Get-Process chrome* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process msedge* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process firefox* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process opera* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process browser* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    await runPowerShellCommand('Get-Process yandex* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue');
    
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
    
    return true;
  } catch (error) {
    log.error('Error stopping browser processes:', error);
    return false;
  }
}

// Отключение неиспользуемых служб
async function disableUnnecessaryServices() {
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
    
    return true;
  } catch (error) {
    log.error('Error disabling services:', error);
    return false;
  }
}

// Настройка приоритетов процессов
async function optimizeProcessPriorities() {
  try {
    // Устанавливаем высокий приоритет для активных процессов
    await runPowerShellCommand(`
      $currentProcess = Get-Process -Id $PID
      $currentProcess.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
    `);
    
    // Устанавливаем более низкий приоритет для фоновых служб
    await runPowerShellCommand('wmic process where name="svchost.exe" CALL setpriority "below normal"');
    
    return true;
  } catch (error) {
    log.error('Error setting process priorities:', error);
    return false;
  }
}

// Оптимизация автозагрузки
async function optimizeStartup() {
  try {
    await runPowerShellCommand('Get-CimInstance Win32_StartupCommand | Select-Object Command, Description | Format-Table -AutoSize');
    
    // Отключение ненужных элементов автозагрузки
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Steam Client Bootstrapper" /f');
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Discord" /f');
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Spotify" /f');
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "EpicGamesLauncher" /f');
    await runPowerShellCommand('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Skype" /f');
    
    return true;
  } catch (error) {
    log.error('Error optimizing startup:', error);
    return false;
  }
}

// Игровой режим
async function enableGamingMode() {
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
    
    return true;
  } catch (error) {
    log.error('Error enabling gaming mode:', error);
    return false;
  }
}

// Настройки конфиденциальности
async function applyPrivacySettings() {
  try {
    // Отключение телеметрии и сбора данных
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f');
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableTailoredExperiencesWithDiagnosticData /t REG_DWORD /d 1 /f');
    await runPowerShellCommand('reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" /v DisabledByGroupPolicy /t REG_DWORD /d 1 /f');
    
    // Отключение отслеживания запусков программ
    await runPowerShellCommand('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_TrackProgs /t REG_DWORD /d 0 /f');
    
    return true;
  } catch (error) {
    log.error('Error applying privacy settings:', error);
    return false;
  }
}

// Запуск оптимизаций на основе выбранных настроек
async function runOptimizations(settings) {
  const results = [];
  
  // Очистка временных файлов
  if (settings.cleanup) {
    const cleanupSuccess = await cleanupTemporaryFiles();
    if (cleanupSuccess) {
      results.push('Временные файлы успешно очищены');
    } else {
      results.push('Ошибка при очистке временных файлов');
    }
  }
  
  // Оптимизация сетевых настроек
  if (settings.network) {
    const networkSuccess = await optimizeNetworkSettings();
    if (networkSuccess) {
      results.push('Сетевые настройки успешно оптимизированы');
    } else {
      results.push('Ошибка при оптимизации сети');
    }
  }
  
  // Отключение фоновых процессов браузеров
  if (settings.browsers) {
    const browsersSuccess = await stopBrowserBackgroundProcesses();
    if (browsersSuccess) {
      results.push('Фоновые процессы браузеров успешно остановлены');
    } else {
      results.push('Ошибка при остановке процессов браузеров');
    }
  }
  
  // Отключение неиспользуемых служб
  if (settings.services) {
    const servicesSuccess = await disableUnnecessaryServices();
    if (servicesSuccess) {
      results.push('Неиспользуемые службы успешно отключены');
    } else {
      results.push('Ошибка при отключении служб');
    }
  }
  
  // Настройка приоритетов процессов
  if (settings.priority) {
    const prioritySuccess = await optimizeProcessPriorities();
    if (prioritySuccess) {
      results.push('Приоритеты процессов успешно настроены');
    } else {
      results.push('Ошибка при настройке приоритетов');
    }
  }
  
  // Оптимизация автозагрузки
  if (settings.startup) {
    const startupSuccess = await optimizeStartup();
    if (startupSuccess) {
      results.push('Автозагрузка успешно оптимизирована');
    } else {
      results.push('Ошибка при оптимизации автозагрузки');
    }
  }
  
  // Игровой режим
  if (settings.gaming) {
    const gamingSuccess = await enableGamingMode();
    if (gamingSuccess) {
      results.push('Игровой режим успешно активирован');
    } else {
      results.push('Ошибка при активации игрового режима');
    }
  }
  
  // Настройки конфиденциальности
  if (settings.privacy) {
    const privacySuccess = await applyPrivacySettings();
    if (privacySuccess) {
      results.push('Настройки конфиденциальности успешно применены');
    } else {
      results.push('Ошибка при настройке конфиденциальности');
    }
  }
  
  // Собираем метрики после оптимизации для сравнения
  const improvements = await collectMetricsAfterOptimization();
  
  return {
    results,
    improvements
  };
}

// Настройка обработчика для оптимизации
function setupOptimizationHandlers(mainWindow, isAdminFn, restartAsAdminFn) {
  // Обработчик для выполнения оптимизаций
  ipcMain.handle('run-optimization', async (event, settings) => {
    log.info('Running optimization with settings:', settings);
    
    // Проверяем наличие прав администратора
    if (!isAdminFn()) {
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
          restartAsAdminFn();
        }
      });
      
      return {
        success: false,
        message: 'Для выполнения оптимизаций требуются права администратора.'
      };
    }
    
    try {
      const { results, improvements } = await runOptimizations(settings);
      
      log.info('Optimization completed with results:', results);
      log.info('Performance improvements:', improvements);
      
      return { 
        success: true, 
        message: 'Оптимизация успешно выполнена! ' + results.join('. '),
        improvements
      };
      
    } catch (error) {
      log.error('Error during optimization:', error);
      return { 
        success: false, 
        message: `Произошла ошибка при оптимизации: ${error.message}` 
      };
    }
  });
}

module.exports = {
  setupOptimizationHandlers,
  runOptimizations
};
