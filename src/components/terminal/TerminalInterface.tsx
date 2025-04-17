
import React from 'react';
import TerminalHeader from './TerminalHeader';
import TerminalProgress from './TerminalProgress';
import TerminalContent from './TerminalContent';
import TerminalFooter from './TerminalFooter';
import { useTerminal } from './useTerminal';
import { TerminalProps } from './types';

const TerminalInterface: React.FC<TerminalProps> = ({ settings, onComplete, onReset }) => {
  const {
    lines,
    isRunning,
    isComplete,
    isElectron,
    progress,
    terminalRef,
    runOptimization,
    clearTerminal
  } = useTerminal(settings, onComplete, onReset);

  return (
    <div className="mt-6 bg-gray-950 border border-gray-800 rounded-lg overflow-hidden shadow-xl">
      <TerminalHeader completed={isComplete} onRunAgain={runOptimization} />
      
      {isRunning && <TerminalProgress progress={progress} />}
      
      <TerminalContent 
        lines={lines}
        isRunning={isRunning}
        terminalRef={terminalRef}
        onStart={runOptimization}
      />
      
      <TerminalFooter 
        isComplete={isComplete}
        isRunning={isRunning}
        isElectron={isElectron}
        onClear={clearTerminal}
        onRun={runOptimization}
      />
    </div>
  );
};

export default TerminalInterface;
