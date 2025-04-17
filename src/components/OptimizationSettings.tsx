import React, { useState } from 'react';
import { Settings, Network, Chrome, Trash2, Power, Cpu, HardDrive, Gamepad2, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OptimizationSettingsProps {
  onSettingsChange: (settings: Record<string, boolean>) => void;
}

const OptimizationSettings: React.FC<OptimizationSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    network: true,
    browsers: true,
    cleanup: true,
    priority: true,
    services: true,
    startup: true,
    gaming: false,
    privacy: false
  });

  const toggleSetting = (key: string) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key as keyof typeof settings]
    };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const SettingItem = ({ id, label, description, icon: Icon }: { id: string, label: string, description: string, icon: React.ElementType }) => (
    <div className="flex justify-between items-center py-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-800 rounded-md">
          <Icon size={18} className="text-cyan-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          <div className="text-xs text-gray-400">{description}</div>
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Switch
              id={id}
              checked={settings[id as keyof typeof settings]}
              onCheckedChange={() => toggleSetting(id)}
              className="data-[state=checked]:bg-cyan-500"
            />
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{settings[id as keyof typeof settings] ? 'Включено' : 'Отключено'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <Settings size={20} className="text-cyan-400" />
          Параметры оптимизации
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SettingItem
          id="network"
          label="Оптимизация сети"
          description="Настройки DNS и TCP/IP для максимальной скорости соединения"
          icon={Network}
        />
        <Separator className="my-2 bg-gray-800" />
        
        <SettingItem
          id="browsers"
          label="Браузеры"
          description="Оптимизация Chrome, Edge, Firefox, Opera и Яндекс Браузер"
          icon={Chrome}
        />
        <Separator className="my-2 bg-gray-800" />
        
        <SettingItem
          id="cleanup"
          label="Очистка системы"
          description="Удаление временных и кэш файлов для освобождения места"
          icon={Trash2}
        />
        <Separator className="my-2 bg-gray-800" />
        
        <SettingItem
          id="services"
          label="Службы Windows"
          description="Отключение неиспользуемых служб для экономии ресурсов"
          icon={Power}
        />
        <Separator className="my-2 bg-gray-800" />
        
        <SettingItem
          id="priority"
          label="Приоритеты процессов"
          description="Настройка приоритетов для повышения отзывчивости"
          icon={Cpu}
        />
        <Separator className="my-2 bg-gray-800" />
        
        <SettingItem
          id="startup"
          label="Автозагрузка"
          description="Оптимизация программ автозапуска Windows"
          icon={HardDrive}
        />
        <Separator className="my-2 bg-gray-800" />
        
        <SettingItem
          id="gaming"
          label="Игровой режим"
          description="Оптимизации для максимальной производительности в играх"
          icon={Gamepad2}
        />
        <Separator className="my-2 bg-gray-800" />
        
        <SettingItem
          id="privacy"
          label="Конфиденциальность"
          description="Отключение телеметрии и повышение приватности"
          icon={Shield}
        />
      </CardContent>
    </Card>
  );
};

export default OptimizationSettings;
