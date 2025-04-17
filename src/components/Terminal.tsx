
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TerminalLineProps {
  content: string;
  color?: 'default' | 'cyan' | 'green' | 'red';
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
    red: 'text-red-500'
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
}

const Terminal: React.FC<TerminalProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<TerminalLineProps[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  const script = [
    { content: '🚀 Старт максимальной оптимизации Windows...', color: 'cyan' as const },
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
    { content: 'reg add "HKCU\\Software\\Google\\Chrome\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
    { content: 'Операция успешно завершена.' },
    { content: 'reg add "HKCU\\Software\\Microsoft\\Edge\\Advanced" /v BackgroundModeEnabled /t REG_DWORD /d 0 /f', isCommand: true },
    { content: 'Операция успешно завершена.' },
    { content: '🧹 Кэш браузеров очищен', color: 'default' as const },
    { content: '⚙️ chrome: приоритет High', color: 'default' as const },
    { content: 'ℹ️ msedge не запущен', color: 'default' as const },
    { content: 'ℹ️ browser не запущен', color: 'default' as const },
    { content: '🧽 TEMP-папки очищены', color: 'default' as const },
    { content: '🛑 Служба WSearch отключена', color: 'default' as const },
    { content: '🛑 Служба DiagTrack отключена', color: 'default' as const },
    { content: '🛑 Служба SysMain отключена', color: 'default' as const },
    { content: '🛑 Служба Fax отключена', color: 'default' as const },
    { content: '🛑 Служба XblGameSave отключена', color: 'default' as const },
    { content: '🛑 Служба XboxGipSvc отключена', color: 'default' as const },
    { content: '🛑 Служба XboxNetApiSvc отключена', color: 'default' as const },
    { content: '🛑 Служба WMPNetworkSvc отключена', color: 'default' as const },
    { content: '✅ Оптимизация завершена! Перезагрузите компьютер для применения всех изменений.', color: 'green' as const },
  ];

  const runScript = () => {
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
          <span className="ml-2 text-gray-300 font-medium">Windows PowerShell</span>
        </div>
        {completed && (
          <button 
            onClick={runScript}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
          >
            Запустить снова
          </button>
        )}
      </div>

      {isRunning && (
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}>
          </div>
        </div>
      )}
      
      <div 
        ref={terminalRef}
        className="bg-gray-900 text-gray-200 p-4 rounded-md shadow-lg overflow-y-auto h-[500px]"
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
          <button 
            onClick={runScript}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mt-4"
          >
            Запустить оптимизацию
          </button>
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
