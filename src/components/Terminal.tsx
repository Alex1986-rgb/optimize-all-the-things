
import React, { useState, useRef, useEffect } from 'react';
import TerminalHeader from './terminal/TerminalHeader';
import TerminalWelcome from './terminal/TerminalWelcome';
import TerminalLine from './terminal/TerminalLine';
import { generateOptimizationCommands } from './terminal/terminalScripts';
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TerminalProps {
  settings: Record<string, boolean>;
  onComplete: () => void;
  onReset: () => void;
}

interface CommandLine {
  id: number;
  text: string;
  type: 'command' | 'output' | 'error' | 'success';
}

const Terminal: React.FC<TerminalProps> = ({ settings, onComplete, onReset }) => {
  const [lines, setLines] = useState<CommandLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const clearTerminal = () => {
    setLines([]);
    setIsComplete(false);
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

    // Check if any settings are enabled
    const hasEnabledSettings = Object.values(settings).some(value => value);
    if (!hasEnabledSettings) {
      setLines([{
        id: Date.now(),
        text: 'Ошибка: не выбраны параметры оптимизации. Пожалуйста, включите хотя бы один параметр.',
        type: 'error'
      }]);
      setIsRunning(false);
      return;
    }

    // Generate the commands to display
    const commands = generateOptimizationCommands(settings);
    
    // Function to add a single line with delay
    const addLineWithDelay = (line: string, type: CommandLine['type'], delay: number) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setLines(prev => [...prev, { id: Date.now(), text: line, type }]);
          resolve();
        }, delay);
      });
    };

    // Add initial message
    await addLineWithDelay('Запуск оптимизации системы...', 'output', 500);
    
    // Process each command with visual effects in the terminal
    for (const command of commands) {
      // Show the command
      await addLineWithDelay(`> ${command.command}`, 'command', 300);
      
      // Show output for each command
      for (const output of command.outputs) {
        await addLineWithDelay(output, 'output', Math.random() * 500 + 200);
      }
    }

    // Run actual optimization if in Electron environment
    if (window.electronAPI) {
      try {
        await addLineWithDelay('Применение оптимизаций к системе...', 'command', 800);
        const result = await window.electronAPI.runOptimization(settings);
        
        if (result.success) {
          await addLineWithDelay(result.message, 'success', 500);
        } else {
          await addLineWithDelay(`Ошибка: ${result.message}`, 'error', 500);
        }
      } catch (error) {
        await addLineWithDelay(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`, 'error', 500);
        setIsRunning(false);
        return;
      }
    }

    // Add completion messages
    await addLineWithDelay('Оптимизация завершена успешно!', 'success', 800);
    await addLineWithDelay('Система работает эффективнее. Мониторинг производительности обновлен.', 'output', 600);
    
    setIsRunning(false);
    setIsComplete(true);
    onComplete();
    
    toast({
      title: "Оптимизация завершена",
      description: "Система успешно оптимизирована"
    });
  };

  return (
    <div className="mt-6 bg-gray-950 border border-gray-800 rounded-lg overflow-hidden shadow-xl">
      <TerminalHeader />
      
      <div 
        ref={terminalRef} 
        className="p-4 max-h-96 overflow-y-auto text-sm font-mono"
        style={{ backgroundColor: '#0d1117' }}
      >
        <TerminalWelcome />
        
        {lines.map(line => (
          <TerminalLine key={line.id} text={line.text} type={line.type} />
        ))}
      </div>
      
      <div className="bg-gray-900 p-3 border-t border-gray-800 flex justify-between items-center">
        <div>
          {isComplete && (
            <span className="text-green-400 text-xs flex items-center">
              <ArrowUpCircle className="mr-1 h-3 w-3" /> 
              Оптимизация успешно завершена
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
