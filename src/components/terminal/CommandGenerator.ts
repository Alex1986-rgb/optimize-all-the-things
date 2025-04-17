
interface Command {
  command: string;
  outputs: string[];
}

export class CommandGenerator {
  generateCommands(settings: Record<string, boolean>): Command[] {
    const commands: Command[] = [];
    
    if (settings.network) {
      commands.push({
        command: 'netsh interface tcp set global autotuninglevel=disabled',
        outputs: ['Настройка автотюнинга TCP выполнена.']
      });
      commands.push({
        command: 'netsh winsock reset',
        outputs: ['Выполняется сброс Winsock. Если команда выполнена успешно, необходима перезагрузка компьютера.']
      });
      commands.push({
        command: 'ipconfig /flushdns',
        outputs: ['Кэш сопоставителя DNS успешно очищен.']
      });
      commands.push({
        command: 'netsh int tcp set global ecncapability=disabled',
        outputs: ['Настройка ECN capability выполнена.']
      });
    }
    
    if (settings.browsers) {
      commands.push({
        command: 'reg add "HKCU\\Software\\Google\\Chrome\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f',
        outputs: ['Операция успешно завершена. Фоновые процессы Chrome отключены.']
      });
      commands.push({
        command: 'reg add "HKCU\\Software\\Microsoft\\Edge\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f',
        outputs: ['Операция успешно завершена. Фоновые процессы Edge отключены.']
      });
      commands.push({
        command: 'reg add "HKCU\\Software\\Yandex\\YandexBrowser\\Background" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f',
        outputs: ['Операция успешно завершена. Фоновые процессы Яндекс.Браузера отключены.']
      });
      commands.push({
        command: 'Get-Process chrome* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue',
        outputs: ['Процессы Chrome успешно остановлены.']
      });
      commands.push({
        command: 'Get-Process msedge* -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue',
        outputs: ['Процессы Edge успешно остановлены.']
      });
    }
    
    if (settings.cleanup) {
      commands.push({
        command: 'Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue',
        outputs: ['Очистка временных файлов пользователя...']
      });
      commands.push({
        command: 'Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue',
        outputs: ['Очистка системных временных файлов...', 'TEMP-папки очищены успешно.']
      });
      commands.push({
        command: 'Clear-RecycleBin -Force -ErrorAction SilentlyContinue',
        outputs: ['Корзина успешно очищена.']
      });
    }
    
    if (settings.priority) {
      commands.push({
        command: '$processes = Get-Process chrome, msedge, browser -ErrorAction SilentlyContinue',
        outputs: ['Получение списка процессов...']
      });
      commands.push({
        command: 'foreach ($p in $processes) { $p.PriorityClass = "High" }',
        outputs: ['Установка приоритетов для процессов браузеров выполнена.']
      });
      commands.push({
        command: 'Set-ProcessPriority -Name WindowsOptimizer -Priority High',
        outputs: ['Приоритет для Windows Optimizer установлен на высокий.']
      });
    }
    
    if (settings.services) {
      commands.push({
        command: 'Stop-Service WSearch -ErrorAction SilentlyContinue',
        outputs: ['Отключение службы поиска Windows...']
      });
      commands.push({
        command: 'Set-Service WSearch -StartupType Disabled',
        outputs: ['Служба WSearch отключена.']
      });
      commands.push({
        command: 'Stop-Service DiagTrack -ErrorAction SilentlyContinue',
        outputs: ['Отключение службы телеметрии Windows...']
      });
      commands.push({
        command: 'Set-Service DiagTrack -StartupType Disabled',
        outputs: ['Служба DiagTrack отключена.']
      });
      commands.push({
        command: 'Stop-Service SysMain -ErrorAction SilentlyContinue',
        outputs: ['Отключение службы Superfetch...']
      });
      commands.push({
        command: 'Set-Service SysMain -StartupType Disabled',
        outputs: ['Служба SysMain отключена.']
      });
      commands.push({
        command: 'Stop-Service dmwappushservice -ErrorAction SilentlyContinue',
        outputs: ['Отключение службы WAP Push Message Routing...']
      });
      commands.push({
        command: 'Set-Service dmwappushservice -StartupType Disabled',
        outputs: ['Служба dmwappushservice отключена.']
      });
    }

    if (settings.startup) {
      commands.push({
        command: 'Get-CimInstance Win32_StartupCommand | Select-Object Command, Description | Format-Table -AutoSize',
        outputs: ['Анализ программ автозагрузки...']
      });
      commands.push({
        command: 'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Steam Client Bootstrapper" /f',
        outputs: ['Удаление Steam из автозагрузки...']
      });
      commands.push({
        command: 'reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "Discord" /f',
        outputs: ['Удаление Discord из автозагрузки...']
      });
    }
    
    if (settings.gaming) {
      commands.push({
        command: 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d 0 /f',
        outputs: ['Оптимизация отзывчивости системы...']
      });
      commands.push({
        command: 'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f',
        outputs: ['Установка приоритета GPU для игр...']
      });
      commands.push({
        command: 'powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c',
        outputs: ['Установлен высокопроизводительный план электропитания']
      });
    }
    
    if (settings.privacy) {
      commands.push({
        command: 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
        outputs: ['Отключение телеметрии Windows...']
      });
      commands.push({
        command: 'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableTailoredExperiencesWithDiagnosticData /t REG_DWORD /d 1 /f',
        outputs: ['Отключение персонализированного контента...']
      });
      commands.push({
        command: 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_TrackProgs /t REG_DWORD /d 0 /f',
        outputs: ['Отключено отслеживание запуска приложений']
      });
    }
    
    return commands;
  }
}
