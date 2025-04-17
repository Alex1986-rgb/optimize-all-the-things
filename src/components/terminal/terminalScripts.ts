
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
] : [];

const getBrowserCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.browsers ? [
  { content: '🌐 Оптимизация браузеров...', color: 'cyan' as const },
  { content: 'reg add "HKCU\\Software\\Google\\Chrome\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
  { content: 'Операция успешно завершена.' },
  { content: 'reg add "HKCU\\Software\\Microsoft\\Edge\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
  { content: 'Операция успешно завершена.' },
  { content: '🧹 Кэш браузеров очищен', color: 'default' as const },
] : [];

const getCleanupCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.cleanup ? [
  { content: '🧹 Очистка системных файлов...', color: 'cyan' as const },
  { content: 'Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue', isCommand: true },
  { content: '🧽 TEMP-папки очищены', color: 'default' as const },
] : [];

const getPriorityCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.priority ? [
  { content: '⚙️ Настройка приоритетов процессов...', color: 'cyan' as const },
  { content: '$processes = Get-Process chrome, msedge, browser -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'foreach ($p in $processes) { $p.PriorityClass = "High" }', isCommand: true },
  { content: '⚙️ chrome: приоритет High', color: 'default' as const },
  { content: 'ℹ️ msedge не запущен', color: 'default' as const },
  { content: 'ℹ️ browser не запущен', color: 'default' as const },
] : [];

const getServicesCommands = (enabledSettings: Record<string, boolean>) => enabledSettings.services ? [
  { content: '🔧 Настройка служб Windows...', color: 'cyan' as const },
  { content: 'Stop-Service WSearch -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service WSearch -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба WSearch отключена', color: 'default' as const },
  { content: 'Stop-Service DiagTrack -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service DiagTrack -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба DiagTrack отключена', color: 'default' as const },
  { content: 'Stop-Service SysMain -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service SysMain -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба SysMain отключена', color: 'default' as const },
  { content: 'Stop-Service Fax -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service Fax -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба Fax отключена', color: 'default' as const },
  { content: 'Stop-Service XblGameSave -ErrorAction SilentlyContinue', isCommand: true },
  { content: 'Set-Service XblGameSave -StartupType Disabled', isCommand: true },
  { content: '🛑 Служба XblGameSave отключена', color: 'default' as const },
] : [];
