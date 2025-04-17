
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Play, RefreshCw, Terminal as TerminalIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TerminalLineProps {
  content: string;
  color?: 'default' | 'cyan' | 'green' | 'red' | 'yellow';
  delay?: number;
  isCommand?: boolean;
}

const TerminalLine: React.FC<TerminalLineProps> = ({ 
  content, 
  color = 'default',
  isCommand = false 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(isCommand);
  
  useEffect(() => {
    if (isCommand) {
      let i = 0;
      const typingSpeed = 30; // ms per character
      
      const typingInterval = setInterval(() => {
        if (i < content.length) {
          setDisplayText(content.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
        }
      }, typingSpeed);
      
      return () => clearInterval(typingInterval);
    } else {
      setDisplayText(content);
    }
  }, [content, isCommand]);
  
  const colorClasses = {
    default: 'text-gray-200',
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    red: 'text-red-500',
    yellow: 'text-yellow-400'
  };

  return (
    <div className={cn(
      'font-mono text-sm md:text-base leading-relaxed break-words',
      colorClasses[color],
      isCommand ? 'pl-6 relative before:content-["PS>"] before:text-green-400 before:absolute before:left-0' : '',
    )}>
      {displayText}
      {isTyping && <span className="animate-pulse">_</span>}
    </div>
  );
};

interface TerminalProps {
  onComplete?: () => void;
  settings?: Record<string, boolean>;
}

const Terminal: React.FC<TerminalProps> = ({ onComplete, settings = {} }) => {
  const [lines, setLines] = useState<TerminalLineProps[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Default all settings to true if not specified
  const enabledSettings = {
    network: true,
    browsers: true,
    cleanup: true,
    services: true,
    priority: true,
    ...settings
  };

  const getNetworkCommands = () => enabledSettings.network ? [
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

  const getBrowserCommands = () => enabledSettings.browsers ? [
    { content: '🌐 Оптимизация браузеров...', color: 'cyan' as const },
    { content: 'reg add "HKCU\\Software\\Google\\Chrome\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
    { content: 'Операция успешно завершена.' },
    { content: 'reg add "HKCU\\Software\\Microsoft\\Edge\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
    { content: 'Операция успешно завершена.' },
    { content: '🧹 Кэш браузеров очищен', color: 'default' as const },
  ] : [];

  const getCleanupCommands = () => enabledSettings.cleanup ? [
    { content: '🧹 Очистка системных файлов...', color: 'cyan' as const },
    { content: 'Remove-Item "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue', isCommand: true },
    { content: 'Remove-Item "C:\\Windows\\Temp\\*" -Recurse -Force -ErrorAction SilentlyContinue', isCommand: true },
    { content: '🧽 TEMP-папки очищены', color: 'default' as const },
  ] : [];

  const getPriorityCommands = () => enabledSettings.priority ? [
    { content: '⚙️ Настройка приоритетов процессов...', color: 'cyan' as const },
    { content: '$processes = Get-Process chrome, msedge, browser -ErrorAction SilentlyContinue', isCommand: true },
    { content: 'foreach ($p in $processes) { $p.PriorityClass = "High" }', isCommand: true },
    { content: '⚙️ chrome: приоритет High', color: 'default' as const },
    { content: 'ℹ️ msedge не запущен', color: 'default' as const },
    { content: 'ℹ️ browser не запущен', color: 'default' as const },
  ] : [];

  const getServicesCommands = () => enabledSettings.services ? [
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

  const generateScript = () => {
    const script: TerminalLineProps[] = [
      { content: '🚀 Старт оптимизации Windows...', color: 'cyan' as const },
    ];
    
    // Add commands based on enabled settings
    script.push(...getNetworkCommands());
    script.push(...getBrowserCommands());
    script.push(...getCleanupCommands());
    script.push(...getPriorityCommands());
    script.push(...getServicesCommands());
    
    // Add final message
    script.push({ content: '✅ Оптимизация завершена! Перезагрузите компьютер для применения всех изменений.', color: 'green' as const });
    
    return script;
  };

  const runScript = () => {
    const script = generateScript();
    setLines([]);
    setIsRunning(true);
    setCompleted(false);
    
    let currentLineIndex = 0;
    
    const addLine = () => {
      if (currentLineIndex < script.length) {
        const line = script[currentLineIndex];
        setLines(prev => [...prev, line]);
        
        // Update progress
        setProgress(Math.floor((currentLineIndex / script.length) * 100));
        
        currentLineIndex++;
        
        // Random delay between lines to simulate real execution
        const delay = line.isCommand ? 800 : Math.random() * 400 + 100;
        
        setTimeout(() => {
          addLine();
          // Scroll to bottom
          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        }, delay);
      } else {
        setIsRunning(false);
        setCompleted(true);
        setProgress(100);
        toast({
          title: "Оптимизация выполнена",
          description: "Все выбранные параметры успешно оптимизированы",
        });
        if (onComplete) {
          onComplete();
        }
      }
    };
    
    addLine();
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-gray-300 font-medium flex items-center gap-2">
            <TerminalIcon size={16} className="text-cyan-400" />
            Windows PowerShell
          </span>
        </div>
        {completed && (
          <Button 
            onClick={runScript}
            variant="outline"
            size="sm"
            className="bg-blue-900 hover:bg-blue-800 border-blue-700 text-white"
          >
            <RefreshCw size={14} className="mr-1" /> Запустить снова
          </Button>
        )}
      </div>

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
        className="bg-gray-900 text-gray-200 p-4 rounded-md shadow-lg overflow-y-auto h-[400px] border border-gray-800"
      >
        {lines.map((line, index) => (
          <TerminalLine 
            key={index}
            content={line.content}
            color={line.color}
            isCommand={line.isCommand}
          />
        ))}
        
        {!isRunning && !completed && (
          <div className="flex flex-col items-center justify-center h-[350px]">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl text-cyan-400 font-bold mb-2">Оптимизация Windows Pro</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Настройте параметры выше и запустите оптимизацию для повышения производительности вашего ПК
              </p>
            </div>
            <Button 
              onClick={runScript}
              size="lg"
              className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white border-0"
            >
              <Play size={16} className="mr-2" /> Запустить оптимизацию
            </Button>
          </div>
        )}
        
        {isRunning && (
          <div className="flex items-center mt-2">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <span className="ml-2">Выполнение...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
