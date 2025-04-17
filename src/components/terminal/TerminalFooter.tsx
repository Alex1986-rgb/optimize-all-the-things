
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, RotateCcw, Shield } from 'lucide-react';

interface TerminalFooterProps {
  isComplete: boolean;
  isRunning: boolean;
  isElectron: boolean;
  onClear: () => void;
  onRun: () => void;
}

const TerminalFooter: React.FC<TerminalFooterProps> = ({
  isComplete,
  isRunning,
  isElectron,
  onClear,
  onRun
}) => {
  return (
    <div className="bg-gray-900 p-3 border-t border-gray-800 flex justify-between items-center">
      <div>
        {isComplete && (
          <span className="text-green-400 text-xs flex items-center">
            <ArrowUpCircle className="mr-1 h-3 w-3" /> 
            Оптимизация успешно завершена
          </span>
        )}
        
        {!isElectron && (
          <span className="text-yellow-400 text-xs flex items-center">
            <Shield className="mr-1 h-3 w-3" />
            Веб-режим (симуляция)
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-gray-300"
          onClick={onClear}
        >
          <RotateCcw className="mr-1 h-4 w-4" /> Сбросить
        </Button>
        
        <Button 
          onClick={onRun}
          disabled={isRunning}
          size="sm"
          className="bg-cyan-700 hover:bg-cyan-600 text-white"
        >
          {isRunning ? 'Выполняется...' : 'Запустить оптимизацию'}
        </Button>
      </div>
    </div>
  );
};

export default TerminalFooter;
