
import { useState, useEffect } from 'react';
import { Battery, Cpu, Wifi, Thermometer, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PerformanceMetric {
  name: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  unit: string;
}

interface PerformanceMetricsProps {
  optimizationComplete?: boolean;
}

// Define the Electron API interface
declare global {
  interface Window {
    electronAPI?: {
      getCpuUsage: () => Promise<number>;
      getMemoryUsage: () => Promise<number>;
      getTemperature: () => Promise<number>;
      getNetworkSpeed: () => Promise<number>;
      runOptimization: (settings: Record<string, boolean>) => Promise<{success: boolean, message: string}>;
      onSystemMetrics: (callback: (data: SystemMetrics) => void) => () => void;
      onAdminRightsWarning: (callback: (data: {message: string}) => void) => () => void;
    }
  }
}

interface SystemMetrics {
  cpu: string;
  memory: string;
  temperature: string;
  networkSpeed: string;
  timestamp: number;
}

const PerformanceMetrics = ({ optimizationComplete = false }: PerformanceMetricsProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    { name: "CPU", value: 0, icon: <Cpu size={20} />, color: "bg-red-500", unit: "%" },
    { name: "Память", value: 0, icon: <Battery size={20} />, color: "bg-blue-500", unit: "%" },
    { name: "Температура", value: 0, icon: <Thermometer size={20} />, color: "bg-amber-500", unit: "°C" },
    { name: "Скорость сети", value: 0, icon: <Wifi size={20} />, color: "bg-green-500", unit: "Мбит/с" },
    { name: "Производительность", value: 0, icon: <Gauge size={20} />, color: "bg-purple-500", unit: "%" }
  ]);
  const { toast } = useToast();
  const [isElectron, setIsElectron] = useState(false);
  const [hasAdminRights, setHasAdminRights] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Проверяем, запущено ли приложение в среде Electron
    const isRunningInElectron = !!window.electronAPI;
    setIsElectron(isRunningInElectron);
    
    if (isRunningInElectron) {
      console.log("Running in Electron environment, using real system metrics");
      
      // Подписываемся на предупреждения о правах администратора
      const unsubscribeAdminWarning = window.electronAPI.onAdminRightsWarning((data) => {
        setHasAdminRights(false);
        toast({
          title: "Предупреждение",
          description: data.message,
          variant: "destructive"
        });
      });
      
      // Подписываемся на обновления метрик в реальном времени
      const unsubscribeMetrics = window.electronAPI.onSystemMetrics((data) => {
        updateMetricsFromData(data);
        setLastUpdate(new Date());
      });
      
      // Сразу запрашиваем текущие метрики
      fetchSystemMetrics();
      
      return () => {
        unsubscribeAdminWarning();
        unsubscribeMetrics();
      };
    } else {
      console.log("Not running in Electron environment, using simulated data");
      simulateMetrics();
    }
  }, []);

  // Функция для обновления метрик из полученных данных
  const updateMetricsFromData = (data: SystemMetrics) => {
    const cpuValue = parseFloat(data.cpu);
    const memoryValue = parseFloat(data.memory);
    const temperatureValue = parseFloat(data.temperature);
    const networkValue = parseFloat(data.networkSpeed);
    
    // Вычисляем общую производительность как обратную величину от нагрузки
    // Чем ниже нагрузка на CPU и память, тем выше производительность
    const performanceScore = 100 - ((cpuValue + memoryValue) / 2);
    
    setMetrics(prev => prev.map(metric => {
      switch(metric.name) {
        case "CPU":
          return {...metric, value: cpuValue};
        case "Память":
          return {...metric, value: memoryValue};
        case "Температура":
          return {...metric, value: temperatureValue};
        case "Скорость сети":
          return {...metric, value: networkValue};
        case "Производительность":
          return {...metric, value: parseFloat(performanceScore.toFixed(1))};
        default:
          return metric;
      }
    }));
  };

  // Запрос метрик вручную (используется при инициализации)
  const fetchSystemMetrics = async () => {
    if (!window.electronAPI) return;
    
    try {
      const cpuUsage = await window.electronAPI.getCpuUsage();
      const memoryUsage = await window.electronAPI.getMemoryUsage();
      const temperature = await window.electronAPI.getTemperature();
      const networkSpeed = await window.electronAPI.getNetworkSpeed();
      
      // Расчет оценки производительности
      const performanceScore = 100 - ((cpuUsage + memoryUsage) / 2);
      
      updateMetricsFromData({
        cpu: cpuUsage.toFixed(1),
        memory: memoryUsage.toFixed(1),
        temperature: temperature.toFixed(1),
        networkSpeed: networkSpeed.toString(),
        timestamp: Date.now()
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching system metrics:", error);
    }
  };

  // Симуляция метрик для веб-версии приложения
  const simulateMetrics = () => {
    const timer = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let value;
        
        if (optimizationComplete) {
          switch(metric.name) {
            case "CPU":
              value = 10 + Math.random() * 15; // Низкая нагрузка после оптимизации
              break;
            case "Память":
              value = 30 + Math.random() * 15; // Сниженное потребление памяти
              break;
            case "Температура":
              value = 40 + Math.random() * 10; // Сниженная температура
              break;
            case "Скорость сети":
              value = 50 + Math.random() * 40; // Улучшенная скорость
              break;
            case "Производительность":
              value = 75 + Math.random() * 20; // Высокая производительность
              break;
            default:
              value = Math.random() * 100;
          }
        } else {
          // До оптимизации - имитация проблем производительности
          switch(metric.name) {
            case "CPU":
              value = 50 + Math.random() * 40; // Высокая нагрузка
              break;
            case "Память":
              value = 60 + Math.random() * 30; // Высокое потребление памяти
              break;
            case "Температура":
              value = 60 + Math.random() * 30; // Высокая температура
              break;
            case "Скорость сети":
              value = 5 + Math.random() * 20; // Низкая скорость
              break;
            case "Производительность":
              value = 20 + Math.random() * 30; // Низкая производительность
              break;
            default:
              value = Math.random() * 100;
          }
        }
        
        return {
          ...metric,
          value: parseFloat(value.toFixed(1))
        };
      }));
      
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(timer);
  };

  return (
    <div className="space-y-4">
      {isElectron && !hasAdminRights && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Отсутствуют права администратора</AlertTitle>
          <AlertDescription>
            Для корректной работы оптимизаций и получения точных метрик, запустите приложение от имени администратора.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 justify-between">
            <div className="flex items-center">
              <Gauge className="text-cyan-400 mr-2" />
              Метрики производительности
              {!isElectron && <span className="text-xs text-gray-400 ml-2">(симуляция)</span>}
            </div>
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Обновлено: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-gray-200">
                    <span className="text-gray-400">{metric.icon}</span>
                    {metric.name}
                  </div>
                  <span className="text-gray-200 font-semibold">
                    {metric.value} {metric.unit}
                  </span>
                </div>
                <Progress 
                  value={metric.name === "Температура" ? 100 - (metric.value / 100 * 100) : metric.value} 
                  className={`h-2 ${getProgressClass(metric)}`}
                />
                <div className="h-0.5 bg-gradient-to-r from-gray-800 via-cyan-900 to-gray-800 rounded-full mt-1 mb-4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {optimizationComplete && (
        <Card className="bg-gray-900 border-gray-700 border-green-700 border-l-4">
          <CardContent className="pt-4">
            <div className="text-green-500 flex items-center gap-2 font-medium">
              <Gauge className="h-5 w-5" />
              Оптимизация успешно выполнена
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Система отслеживает улучшение производительности. Вы можете увидеть изменения в реальном времени.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Вспомогательная функция для определения цвета прогресс-бара
function getProgressClass(metric: PerformanceMetric): string {
  // Для температуры: красный - плохо, зеленый - хорошо
  if (metric.name === "Температура") {
    if (metric.value > 80) return "bg-red-500";
    if (metric.value > 70) return "bg-orange-500";
    if (metric.value > 60) return "bg-yellow-500";
    return "bg-green-500";
  }
  
  // Для скорости сети: зеленый - хорошо, красный - плохо
  if (metric.name === "Скорость сети") {
    if (metric.value < 10) return "bg-red-500";
    if (metric.value < 30) return "bg-orange-500";
    if (metric.value < 50) return "bg-yellow-500";
    return "bg-green-500";
  }
  
  // Для производительности: зеленый - хорошо, красный - плохо
  if (metric.name === "Производительность") {
    if (metric.value < 30) return "bg-red-500";
    if (metric.value < 50) return "bg-orange-500";
    if (metric.value < 70) return "bg-yellow-500";
    return "bg-green-500";
  }
  
  // Для CPU и памяти: красный - высокая нагрузка (плохо), зеленый - низкая нагрузка (хорошо)
  if (metric.value > 80) return "bg-red-500";
  if (metric.value > 60) return "bg-orange-500";
  if (metric.value > 40) return "bg-yellow-500";
  return "bg-green-500";
}

export default PerformanceMetrics;
