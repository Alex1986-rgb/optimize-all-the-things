
import { TerminalLineProps } from './TerminalLine';

export const generateScript = (enabledSettings: Record<string, boolean>): TerminalLineProps[] => {
  const script: TerminalLineProps[] = [
    { content: '🚀 Старт оптимизации Windows...', color: 'cyan' as const },
  ];
  
  script.push(...getNetworkCommands(enabledSettings));
  script.push(...getBrowserCommands(enabledSettings));
  script.push(...getCleanupCommands(enabledSettings));
  script.push(...getPriorityCommands(enabledSettings));
  script.push(...getServicesCommands(enabledSettings));
  script.push(...getStartupCommands(enabledSettings));
  script.push(...getGamingCommands(enabledSettings));
  script.push(...getPrivacyCommands(enabledSettings));
  
  script.push({ content: '✅ Оптимизация завершена! Перезагрузите компьютер для применения всех изменений.', color: 'green' as const });
  
  return script;
};

const getNetworkCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.network ? [
  { content: '🌐 Настройка сетевых параметров...', color: 'cyan' as const },
  { content: 'netsh interface tcp set global autotuninglevel=disabled', isCommand: true },
  { content: 'netsh interface tcp set heuristics disabled', isCommand: true },
  { content: 'netsh winsock reset', isCommand: true },
  { content: 'Выполняется сброс Winsock. Если команда выполнена успешно, необходима перезагрузка компьютера' },
  { content: 'netsh int ip reset', isCommand: true },
  { content: 'Сброс параметров TCP/IP успешно выполнен.' },
  { content: 'ipconfig /flushdns', isCommand: true },
  { content: 'Кэш сопоставителя DNS успешно очищен.' },
  { content: 'netsh interface ipv4 set subinterface "Беспроводная сеть" mtu=1492 store=persistent', isCommand: true },
  { content: 'Ok.' },
  { content: 'netsh int tcp set global rss=enabled', isCommand: true },
  { content: 'Ok.' },
  { content: 'netsh int tcp set supplemental Internet congestionprovider=ctcp', isCommand: true },
  { content: 'Ok.' },
  { content: '🔧 Применение оптимальных DNS-серверов Google...' },
  { content: 'netsh interface ip set dns "Ethernet" static 8.8.8.8 primary', isCommand: true },
  { content: 'netsh interface ip add dns "Ethernet" 8.8.4.4 index=2', isCommand: true },
] : [];

const getBrowserCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.browsers ? [
  { content: '🌐 Оптимизация браузеров...', color: 'cyan' as const },
  { content: '🌐 Google Chrome...', color: 'default' as const },
  { content: 'reg add "HKCU\\Software\\Google\\Chrome\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
  { content: 'Операция успешно завершена.' },
  { content: '🌐 Microsoft Edge...', color: 'default' as const },
  { content: 'reg add "HKCU\\Software\\Microsoft\\Edge\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
  { content: 'Операция успешно завершена.' },
  { content: '🌐 Mozilla Firefox...', color: 'default' as const },
  { content: 'reg add "HKCU\\Software\\Mozilla\\Firefox" /v DisableAppUpdate /t REG_DWORD /d 1 /f', isCommand: true },
  { content: 'Операция успешно завершена.' },
  { content: '🌐 Яндекс Браузер...', color: 'default' as const },
  { content: 'reg add "HKCU\\Software\\Yandex\\YandexBrowser\\Background" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
  { content: 'Операция успешно завершена.' },
  { content: '🌐 Opera...', color: 'default' as const },
  { content: 'reg add "HKCU\\Software\\Opera Software\\Preferences" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
  { content: 'Операция успешно завершена.' },
  { content: 'taskkill /f /im chrome.exe /t', isCommand: true },
  { content: 'taskkill /f /im msedge.exe /t', isCommand: true },
  { content: 'taskkill /f /im firefox.exe /t', isCommand: true },
  { content: 'taskkill /f /im browser.exe /t', isCommand: true },
  { content: 'taskkill /f /im opera.exe /t', isCommand: true },
  { content: '🧹 Кэш браузеров очищен', color: 'default' as const },
] : [];

const getCleanupCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.cleanup ? [
  { content: '🧹 Очистка системных файлов...', color: 'cyan' as const },
  { content: 'Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Remove-Item "$env:LOCALAPPDATA\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue', isCommand: true },
  { content: '🧽 TEMP-папки очищены', color: 'default' as const },
  { content: 'cleanmgr /sagerun:1', isCommand: true },
  { content: '🧽 Запущена встроенная очистка диска', color: 'default' as const },
  { content: 'DISM.exe /Online /Cleanup-Image /StartComponentCleanup', isCommand: true },
  { content: '🧽 Образ Windows очищен от компонентов обновления', color: 'default' as const },
] : [];

const getPriorityCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.priority ? [
  { content: '⚙️ Настройка приоритетов процессов...', color: 'cyan' as const },
  { content: '$processes = Get-Process chrome, msedge, browser, firefox, opera, yandexbrowser -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'foreach ($p in $processes) { $p.PriorityClass = "High" }', isCommand: true },
  { content: '⚙️ Установлен высокий приоритет для браузеров', color: 'default' as const },
  { content: '$processes = Get-Process explorer -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'foreach ($p in $processes) { $p.PriorityClass = "High" }', isCommand: true },
  { content: '⚙️ Установлен высокий приоритет для Проводника', color: 'default' as const },
  { content: 'wmic process where name="svchost.exe" CALL setpriority "below normal"', isCommand: true },
  { content: '⚙️ Уменьшен приоритет служебных процессов', color: 'default' as const },
] : [];

const getServicesCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.services ? [
  { content: '🔧 Настройка служб Windows...', color: 'cyan' as const },
  { content: 'Stop-Service WSearch -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service WSearch -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба Windows Search отключена', color: 'default' as const },
  { content: 'Stop-Service DiagTrack -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service DiagTrack -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба Диагностическая телеметрия отключена', color: 'default' as const },
  { content: 'Stop-Service SysMain -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service SysMain -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба SuperFetch отключена', color: 'default' as const },
  { content: 'Stop-Service Fax -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service Fax -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба Факс отключена', color: 'default' as const },
  { content: 'Stop-Service XblGameSave -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service XblGameSave -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба Xbox Game Save отключена', color: 'default' as const },
  { content: 'Stop-Service XboxNetApiSvc -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service XboxNetApiSvc -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба Xbox Live Networking Service отключена', color: 'default' as const },
  { content: 'Stop-Service TabletInputService -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service TabletInputService -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба сенсорной клавиатуры отключена', color: 'default' as const },
] : [];

const getStartupCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.startup ? [
  { content: '🚀 Оптимизация автозагрузки...', color: 'cyan' as const },
  { content: 'Get-CimInstance Win32_StartupCommand | Select-Object Command, Description | Format-Table -AutoSize', isCommand: true },
  { content: 'Анализ программ автозагрузки...', color: 'default' as const },
  { content: 'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Steam Client Bootstrapper" /f', isCommand: true },
  { content: 'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Discord" /f', isCommand: true },
  { content: 'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Spotify" /f', isCommand: true },
  { content: 'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "EpicGamesLauncher" /f', isCommand: true },
  { content: 'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Skype" /f', isCommand: true },
  { content: '🛑 Удалены неиспользуемые программы из автозагрузки', color: 'default' as const },
] : [];

const getGamingCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.gaming ? [
  { content: '🎮 Оптимизация для игр...', color: 'cyan' as const },
  { content: 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f', isCommand: true },
  { content: 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f', isCommand: true },
  { content: 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Priority" /t REG_DWORD /d 6 /f', isCommand: true },
  { content: 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d "High" /f', isCommand: true },
  { content: '🎮 Включен игровой режим Windows', color: 'default' as const },
  { content: 'powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c', isCommand: true },
  { content: '⚡ Установлен высокопроизводительный план электропитания', color: 'default' as const },
  { content: 'bcdedit /set disabledynamictick yes', isCommand: true },
  { content: '🎮 Отключены динамические тики таймера', color: 'default' as const },
] : [];

const getPrivacyCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.privacy ? [
  { content: '🔒 Настройки конфиденциальности...', color: 'cyan' as const },
  { content: 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f', isCommand: true },
  { content: 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableTailoredExperiencesWithDiagnosticData /t REG_DWORD /d 1 /f', isCommand: true },
  { content: 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo" /v DisabledByGroupPolicy /t REG_DWORD /d 1 /f', isCommand: true },
  { content: '🔒 Телеметрия и персонализированная реклама отключены', color: 'default' as const },
  { content: 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_TrackProgs /t REG_DWORD /d 0 /f', isCommand: true },
  { content: '🔒 Отключено отслеживание запуска приложений', color: 'default' as const },
  { content: 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f', isCommand: true },
  { content: '🔒 Отключен сбор телеметрии на уровне политик', color: 'default' as const },
] : [];
