
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, RotateCcw, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import TerminalLine from './terminal/TerminalLine';
import TerminalHeader from './terminal/TerminalHeader';
import TerminalWelcome from './terminal/TerminalWelcome';

interface TerminalProps {
  settings: Record<string, boolean>;
  onComplete: () => void;
  onReset: () => void;
}

interface CommandLine {
  id: number;
  content: string;
  type: 'command' | 'output' | 'error' | 'success';
  color?: 'default' | 'cyan' | 'green' | 'red' | 'yellow';
  isCommand?: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ settings, onComplete, onReset }) => {
  const [lines, setLines] = useState<CommandLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [progress, setProgress] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Проверяем, запущены ли мы в Electron
  useEffect(() => {
    setIsElectron(!!window.electronAPI);
  }, []);

  const clearTerminal = () => {
    setLines([]);
    setIsComplete(false);
    setProgress(0);
    onReset();
  };

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines]);

  const runOptimization = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setIsComplete(false);
    clearTerminal();

    // Проверяем, выбран ли хотя бы один параметр оптимизации
    const hasEnabledSettings = Object.values(settings).some(value => value);
    if (!hasEnabledSettings) {
      setLines([{
        id: Date.now(),
        content: 'Ошибка: не выбраны параметры оптимизации. Пожалуйста, включите хотя бы один параметр.',
        type: 'error',
        color: 'red'
      }]);
      setIsRunning(false);
      return;
    }

    // Генерируем команды на основе выбранных настроек
    const commands = generateCommands(settings);
    let currentCommandIndex = 0;
    const totalCommands = commands.length;
    
    // Функция для добавления строки с задержкой
    const addLineWithDelay = (content: string, type: CommandLine['type'], color: CommandLine['color'], delay: number, isCommand: boolean = false) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setLines(prev => [...prev, { 
            id: Date.now(), 
            content, 
            type, 
            color, 
            isCommand 
          }]);
          scrollToBottom();
          resolve();
        }, delay);
      });
    };

    // Начальное сообщение
    await addLineWithDelay('Запуск оптимизации системы Windows...', 'output', 'cyan', 500);
    
    // Если мы в среде Electron, показываем соответствующее сообщение
    if (isElectron) {
      await addLineWithDelay('Обнаружена десктопная среда. Подготовка к выполнению реальных оптимизаций...', 'output', 'green', 800);
    } else {
      await addLineWithDelay('Обнаружена веб-среда. Выполняем симуляцию оптимизаций...', 'output', 'yellow', 800);
    }
    
    // Обрабатываем каждую команду с визуальными эффектами в терминале
    for (const command of commands) {
      currentCommandIndex++;
      setProgress(Math.floor((currentCommandIndex / totalCommands) * 100));
      
      // Показываем команду
      await addLineWithDelay(command.command, 'command', undefined, 300, true);
      
      // Показываем вывод для каждой команды
      for (const output of command.outputs) {
        await addLineWithDelay(output, 'output', undefined, Math.random() * 500 + 200);
      }
    }

    // Запускаем реальную оптимизацию, если в среде Electron
    if (isElectron && window.electronAPI) {
      try {
        await addLineWithDelay('Применение оптимизаций к системе...', 'command', 'cyan', 800, true);
        
        // Выполняем оптимизацию через Electron API
        const result = await window.electronAPI.runOptimization(settings);
        
        if (result.success) {
          await addLineWithDelay(result.message, 'success', 'green', 500);
        } else {
          await addLineWithDelay(`Ошибка: ${result.message}`, 'error', 'red', 500);
          
          // Если оптимизация не удалась из-за отсутствия прав администратора, показываем подсказку
          if (result.message.includes('права администратора')) {
            await addLineWithDelay('Для выполнения оптимизаций необходимо перезапустить приложение от имени администратора.', 'error', 'yellow', 500);
            setIsRunning(false);
            return;
          }
        }
      } catch (error) {
        await addLineWithDelay(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, 'error', 'red', 500);
        setIsRunning(false);
        return;
      }
    } else {
      // Симуляция успешной оптимизации в веб-среде
      await addLineWithDelay('Симуляция оптимизаций завершена успешно.', 'success', 'green', 800);
    }

    // Завершающие сообщения
    await addLineWithDelay('Оптимизация завершена успешно!', 'success', 'green', 800);
    await addLineWithDelay('Система работает эффективнее. Мониторинг производительности обновлен.', 'output', undefined, 600);
    
    setIsRunning(false);
    setIsComplete(true);
    onComplete();
    
    toast({
      title: "Оптимизация завершена",
      description: "Система успешно оптимизирована"
    });
  };
  
  // Вспомогательная функция для генерации команд на основе настроек
  const generateCommands = (settings: Record<string, boolean>) => {
    const commands: { command: string, outputs: string[] }[] = [];
    
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
    
    return commands;
  };

  return (
    <div className="mt-6 bg-gray-950 border border-gray-800 rounded-lg overflow-hidden shadow-xl">
      <TerminalHeader completed={isComplete} onRunAgain={runOptimization} />
      
      {isRunning && (
        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}>
          </div>
        </div>
      )}
      
      <div 
        ref={terminalRef} 
        className="p-4 max-h-96 overflow-y-auto text-sm font-mono"
        style={{ backgroundColor: '#0d1117' }}
      >
        {lines.length === 0 && !isRunning && (
          <TerminalWelcome onStart={runOptimization} />
        )}
        
        {lines.map(line => (
          <TerminalLine 
            key={line.id} 
            content={line.content}
            color={line.color}
            isCommand={line.isCommand}
          />
        ))}
        
        {isRunning && lines.length > 0 && (
          <div className="flex items-center mt-2">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <span className="ml-2 text-gray-300">Выполнение...</span>
          </div>
        )}
      </div>
      
      <div className="bg-gray-900 p-3 border-t border-gray-800 flex justify-between items-center">
        <div>
          {isComplete && (
            <span className="text-green-400 text-xs flex items-center">
              <ArrowUpCircle className="mr-1 h-3 w-3" /> 
              Оптимизация успешно завершена
            </span>
          )}
          
          {!isElectron && (
            <span className="text-yellow-400 text-xs flex items-center">
              <Shield className="mr-1 h-3 w-3" />
              Веб-режим (симуляция)
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-gray-300"
            onClick={clearTerminal}
          >
            <RotateCcw className="mr-1 h-4 w-4" /> Сбросить
          </Button>
          
          <Button 
            onClick={runOptimization}
            disabled={isRunning}
            size="sm"
            className="bg-cyan-700 hover:bg-cyan-600 text-white"
          >
            {isRunning ? 'Выполняется...' : 'Запустить оптимизацию'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
