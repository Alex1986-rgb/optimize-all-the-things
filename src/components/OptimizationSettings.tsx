
import { useState } from 'react';
import { Sliders, CheckCircle2, Network, Trash2, Clock, Cpu } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OptimizationOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultEnabled: boolean;
}

const OptimizationSettings = ({ 
  onSettingsChange 
}: { 
  onSettingsChange: (settings: Record<string, boolean>) => void 
}) => {
  const optimizationOptions: OptimizationOption[] = [
    {
      id: "network",
      label: "Оптимизация сети",
      description: "Настройка TCP/IP параметров для увеличения скорости интернета",
      icon: <Network className="text-blue-400" size={20} />,
      defaultEnabled: true
    },
    {
      id: "browsers",
      label: "Отключение фоновых процессов браузеров",
      description: "Предотвращает автозапуск и работу браузеров в фоне",
      icon: <Clock className="text-purple-400" size={20} />,
      defaultEnabled: true
    },
    {
      id: "cleanup",
      label: "Очистка кэша и временных файлов",
      description: "Удаление неиспользуемых файлов для освобождения места",
      icon: <Trash2 className="text-green-400" size={20} />,
      defaultEnabled: true
    },
    {
      id: "services",
      label: "Отключение ненужных служб",
      description: "Остановка неиспользуемых служб Windows для экономии ресурсов",
      icon: <CheckCircle2 className="text-amber-400" size={20} />,
      defaultEnabled: true
    },
    {
      id: "priority",
      label: "Оптимизация приоритетов",
      description: "Настройка приоритетов процессов для более быстрой работы",
      icon: <Cpu className="text-red-400" size={20} />,
      defaultEnabled: true
    }
  ];

  const [settings, setSettings] = useState<Record<string, boolean>>(
    optimizationOptions.reduce((acc, option) => ({
      ...acc,
      [option.id]: option.defaultEnabled
    }), {})
  );

  const handleToggleChange = (id: string, enabled: boolean) => {
    const newSettings = { ...settings, [id]: enabled };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Card className="bg-gray-900 border-gray-700 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="text-cyan-400" />
          <CardTitle className="text-white">Настройка параметров оптимизации</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {optimizationOptions.map((option) => (
            <div key={option.id} className="flex items-start space-x-4 bg-gray-800 p-4 rounded-md">
              <div className="mt-1">{option.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor={option.id} className="text-white font-medium">
                    {option.label}
                  </Label>
                  <Switch
                    id={option.id}
                    checked={settings[option.id]}
                    onCheckedChange={(checked) => handleToggleChange(option.id, checked)}
                  />
                </div>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationSettings;
