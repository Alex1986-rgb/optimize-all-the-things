
import React from 'react';
import TerminalInterface from './TerminalInterface';
import { TerminalProps } from './types';

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
