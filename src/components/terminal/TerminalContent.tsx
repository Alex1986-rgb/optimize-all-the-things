
import React from 'react';
import TerminalLine from './TerminalLine';
import TerminalWelcome from './TerminalWelcome';
import { CommandLine } from './types';

interface TerminalContentProps {
  lines: CommandLine[];
  isRunning: boolean;
  terminalRef: React.RefObject<HTMLDivElement>;
  onStart: () => void;
}

const TerminalContent: React.FC<TerminalContentProps> = ({ 
  lines, 
  isRunning, 
  terminalRef, 
  onStart 
}) => {
  return (
    <div 
      ref={terminalRef} 
      className="p-4 max-h-96 overflow-y-auto text-sm font-mono"
      style={{ backgroundColor: '#0d1117' }}
    >
      {lines.length === 0 && !isRunning && (
        <TerminalWelcome onStart={onStart} />
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
  );
};

export default TerminalContent;
