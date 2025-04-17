
import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TerminalWelcomeProps {
  onStart: () => void;
}

const TerminalWelcome: React.FC<TerminalWelcomeProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[350px]">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🚀</div>
        <h3 className="text-xl text-cyan-400 font-bold mb-2">Оптимизация Windows Pro</h3>
        <p className="text-gray-400 mb-6 max-w-md">
          Настройте параметры выше и запустите оптимизацию для повышения производительности вашего ПК
        </p>
      </div>
      <Button 
        onClick={onStart}
        size="lg"
        className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white border-0"
      >
        <Play size={16} className="mr-2" /> Запустить оптимизацию
      </Button>
    </div>
  );
};

export default TerminalWelcome;
