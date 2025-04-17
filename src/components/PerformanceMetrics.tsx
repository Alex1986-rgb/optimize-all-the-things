
import { useState, useEffect } from 'react';
import { Battery, Cpu, Wifi, Thermometer, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

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

const PerformanceMetrics = ({ optimizationComplete = false }: PerformanceMetricsProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    { name: "CPU", value: 65, icon: <Cpu size={20} />, color: "bg-red-500", unit: "%" },
    { name: "Память", value: 48, icon: <Battery size={20} />, color: "bg-blue-500", unit: "%" },
    { name: "Температура", value: 70, icon: <Thermometer size={20} />, color: "bg-amber-500", unit: "°C" },
    { name: "Скорость сети", value: 32, icon: <Wifi size={20} />, color: "bg-green-500", unit: "Мбит/с" },
    { name: "Производительность", value: 58, icon: <Gauge size={20} />, color: "bg-purple-500", unit: "%" }
  ]);
  const { toast } = useToast();

  // В этой функции в будущем можно будет реализовать реальный мониторинг с помощью Node.js или Electron
  const fetchRealPerformanceData = async () => {
    // Заглушка для будущей реализации с реальными данными
    console.log("Fetching real performance data...");
    // В настоящей реализации здесь был бы код для получения реальных данных
  };

  // Симуляция улучшения производительности после оптимизации
  const simulateOptimization = () => {
    const timer = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let improvement = 0;
        switch(metric.name) {
          case "CPU":
            improvement = 25;
            break;
          case "Память":
            improvement = 15;
            break;
          case "Температура":
            improvement = -15; // Lower is better
            break;
          case "Скорость сети":
            improvement = 40;
            break;
          case "Производительность":
            improvement = 30;
            break;
        }
        
        // For temperature, we want to decrease the value
        const newValue = metric.name === "Температура"
          ? Math.max(35, metric.value - improvement * Math.random())
          : Math.min(98, metric.value + improvement * Math.random());
          
        return {
          ...metric,
          value: Number(newValue.toFixed(1))
        };
      }));
    }, 1500);

    return () => clearInterval(timer);
  };

  // Effect to run optimization simulation when optimizationComplete changes to true
  useEffect(() => {
    if (optimizationComplete) {
      toast({
        title: "Оптимизация завершена",
        description: "Система отслеживает улучшение производительности",
      });
      
      // В реальном приложении здесь можно было бы запустить fetchRealPerformanceData
      const cleanup = simulateOptimization();
      return cleanup;
    }
  }, [optimizationComplete, toast]);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gauge className="text-cyan-400" />
          Метрики производительности
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
                className="h-2 bg-gray-700" 
              />
              <div className="h-0.5 bg-gradient-to-r from-gray-800 via-cyan-900 to-gray-800 rounded-full mt-1 mb-4"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetrics;
