
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

// Define the Electron API interface
declare global {
  interface Window {
    electronAPI?: {
      getCpuUsage: () => Promise<number>;
      getMemoryUsage: () => Promise<number>;
      getTemperature: () => Promise<number>;
      getNetworkSpeed: () => Promise<number>;
      runOptimization: (settings: Record<string, boolean>) => Promise<{success: boolean, message: string}>;
    }
  }
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

  useEffect(() => {
    // Check if running in Electron environment
    if (window.electronAPI) {
      setIsElectron(true);
      fetchSystemMetrics();
      
      // Set up interval to continuously update metrics
      const intervalId = setInterval(fetchSystemMetrics, 2000);
      
      return () => clearInterval(intervalId);
    } else {
      console.log("Not running in Electron environment, using simulated data");
      simulateMetrics();
    }
  }, []);

  const fetchSystemMetrics = async () => {
    if (!window.electronAPI) return;
    
    try {
      // Fetch real metrics from Electron API
      const cpuUsage = await window.electronAPI.getCpuUsage();
      const memoryUsage = await window.electronAPI.getMemoryUsage();
      const temperature = await window.electronAPI.getTemperature();
      const networkSpeed = await window.electronAPI.getNetworkSpeed();
      
      // Calculate a performance score based on CPU and memory
      const performanceScore = 100 - ((cpuUsage + memoryUsage) / 2);
      
      setMetrics(prev => prev.map(metric => {
        switch(metric.name) {
          case "CPU":
            return {...metric, value: parseFloat(cpuUsage.toFixed(1))};
          case "Память":
            return {...metric, value: parseFloat(memoryUsage.toFixed(1))};
          case "Температура":
            return {...metric, value: parseFloat(temperature.toFixed(1))};
          case "Скорость сети":
            return {...metric, value: parseFloat(networkSpeed.toFixed(1))};
          case "Производительность":
            return {...metric, value: parseFloat(performanceScore.toFixed(1))};
          default:
            return metric;
        }
      }));
    } catch (error) {
      console.error("Error fetching system metrics:", error);
    }
  };

  // Simulate metrics for web/dev environment
  const simulateMetrics = () => {
    const timer = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        let value = Math.random() * 100;
        
        // Temperature should be between 35-90
        if (metric.name === "Температура") {
          value = 35 + Math.random() * 55;
        }
        
        // Network speed between 1-100 Mbps
        if (metric.name === "Скорость сети") {
          value = 1 + Math.random() * 99;
        }
        
        return {
          ...metric,
          value: parseFloat(value.toFixed(1))
        };
      }));
    }, 2000);

    return () => clearInterval(timer);
  };

  // Effect for optimization simulation
  useEffect(() => {
    if (optimizationComplete && !isElectron) {
      toast({
        title: "Оптимизация завершена",
        description: "Система отслеживает улучшение производительности",
      });
      
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
    }
  }, [optimizationComplete, toast, isElectron]);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gauge className="text-cyan-400" />
          Метрики производительности
          {!isElectron && <span className="text-xs text-gray-400 ml-2">(симуляция)</span>}
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
