
import React from 'react';
import { Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const Header = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          Windows Optimizer Pro
        </h1>
        <p className="text-gray-400 mt-2">
          Профессиональная оптимизация и ускорение работы Windows
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-700 bg-gray-800 text-white">
                <Shield size={16} className="mr-1 text-cyan-400" />
                <span className="hidden sm:inline">Версия</span> 1.2.3
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p>Windows Optimizer Pro</p>
                <p className="text-gray-400">Разработчик: Kyrlan Alexandr</p>
                <p className="text-gray-400">При поддержке MyArredo</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="border-gray-700 bg-gray-800">
                <Info size={16} className="text-cyan-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs max-w-[250px]">
                <p className="font-medium mb-1">О приложении</p>
                <p className="text-gray-400">©2025 Windows Optimizer Pro</p>
                <p className="text-gray-400">Все права защищены</p>
                <p className="mt-1 text-cyan-500">Разработчик: Kyrlan Alexandr</p>
                <p className="text-cyan-500">При поддержке MyArredo</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
};

export default Header;
