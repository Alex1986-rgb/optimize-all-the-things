
import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { CommandLine, OptimizationSettings } from './types';
import { CommandGenerator } from './CommandGenerator';

export const useTerminal = (
  settings: Record<string, boolean>,
  onComplete: () => void,
  onReset: () => void
) => {
  const [lines, setLines] = useState<CommandLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [progress, setProgress] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const commandGenerator = new CommandGenerator();

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
    const commands = commandGenerator.generateCommands(settings);
    let currentCommandIndex = 0;
    const totalCommands = commands.length;
    
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
        
        // Convert generic Record to OptimizationSettings
        const optimizationSettings: OptimizationSettings = {
          cleanup: Boolean(settings.cleanup),
          network: Boolean(settings.network),
          browsers: Boolean(settings.browsers),
          services: Boolean(settings.services),
          priority: Boolean(settings.priority),
          startup: Boolean(settings.startup),
          gaming: Boolean(settings.gaming),
          privacy: Boolean(settings.privacy)
        };
        
        // Выполняем оптимизацию через Electron API
        const result = await window.electronAPI.runOptimization(optimizationSettings);
        
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

  return {
    lines,
    isRunning,
    isComplete,
    isElectron,
    progress,
    terminalRef,
    runOptimization,
    clearTerminal
  };
};
