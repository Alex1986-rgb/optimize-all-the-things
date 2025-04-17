
import React from 'react';
import Terminal from './terminal/Terminal';

interface TerminalProps {
  settings: Record<string, boolean>;
  onComplete: () => void;
  onReset: () => void;
}

// This is a wrapper component to maintain backward compatibility
const TerminalWrapper: React.FC<TerminalProps> = ({ settings, onComplete, onReset }) => {
  return (
    <Terminal
      settings={settings}
      onComplete={onComplete}
      onReset={onReset}
    />
  );
};

export default TerminalWrapper;
