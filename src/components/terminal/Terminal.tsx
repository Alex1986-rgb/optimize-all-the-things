
import React from 'react';
import TerminalInterface from './TerminalInterface';

interface TerminalProps {
  settings: Record<string, boolean>;
  onComplete: () => void;
  onReset: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ settings, onComplete, onReset }) => {
  return (
    <TerminalInterface 
      settings={settings}
      onComplete={onComplete}
      onReset={onReset}
    />
  );
};

export default Terminal;
