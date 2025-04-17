
import React from 'react';
import Terminal from './terminal/Terminal';
import { TerminalProps } from './terminal/types';

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
