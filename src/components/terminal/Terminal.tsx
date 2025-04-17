
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import TerminalLine, { TerminalLineProps } from './TerminalLine';
import TerminalHeader from './TerminalHeader';
import TerminalWelcome from './TerminalWelcome';
import { generateScript } from './terminalScripts';

interface TerminalProps {
  onComplete?: () => void;
  settings?: Record<string, boolean>;
  onReset?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ onComplete, settings = {}, onReset }) => {
  const [lines, setLines] = useState<TerminalLineProps[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const enabledSettings = {
    network: true,
    browsers: true,
    cleanup: true,
    services: true,
    priority: true,
    ...settings
  };

  const runScript = () => {
    const script = generateScript(enabledSettings);
    setLines([]);
    setIsRunning(true);
    setCompleted(false);
    
    let currentLineIndex = 0;
    
    const addLine = () => {
      if (currentLineIndex < script.length) {
        const line = script[currentLineIndex];
        setLines(prev => [...prev, line]);
        
        setProgress(Math.floor((currentLineIndex / script.length) * 100));
        
        currentLineIndex++;
        
        const delay = line.isCommand ? 800 : Math.random() * 400 + 100;
        
        setTimeout(() => {
          addLine();
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

  const handleRunAgain = () => {
    if (onReset) onReset();
    runScript();
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <TerminalHeader completed={completed} onRunAgain={handleRunAgain} />

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
          <TerminalWelcome onStart={runScript} />
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
