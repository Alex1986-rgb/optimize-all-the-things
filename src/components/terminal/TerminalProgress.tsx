
import React from 'react';

interface TerminalProgressProps {
  progress: number;
}

const TerminalProgress: React.FC<TerminalProgressProps> = ({ progress }) => {
  return (
    <div className="w-full bg-gray-800 rounded-full h-2.5 mb-1 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
        style={{ width: `${progress}%` }}>
      </div>
    </div>
  );
};

export default TerminalProgress;
