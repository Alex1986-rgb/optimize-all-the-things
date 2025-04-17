
import React from 'react';
import { RefreshCw, Terminal as TerminalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TerminalHeaderProps {
  completed: boolean;
  onRunAgain: () => void;
}

const TerminalHeader: React.FC<TerminalHeaderProps> = ({ completed, onRunAgain }) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2 items-center">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-gray-300 font-medium flex items-center gap-2">
          <TerminalIcon size={16} className="text-cyan-400" />
          Windows PowerShell
        </span>
      </div>
      {completed && (
        <Button 
          onClick={onRunAgain}
          variant="outline"
          size="sm"
          className="bg-blue-900 hover:bg-blue-800 border-blue-700 text-white"
        >
          <RefreshCw size={14} className="mr-1" /> Запустить снова
        </Button>
      )}
    </div>
  );
};

export default TerminalHeader;
