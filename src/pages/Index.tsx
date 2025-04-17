import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Terminal from "@/components/Terminal";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import OptimizationSettings from "@/components/OptimizationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Index = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [optimizationSettings, setOptimizationSettings] = useState<Record<string, boolean>>({});
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSettingsChange = (newSettings: Record<string, boolean>) => {
    setOptimizationSettings(newSettings);
  };

  const handleOptimizationComplete = () => {
    setOptimizationComplete(true);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-6">
      <div className="w-full max-w-5xl mx-auto">
        <Header />
        
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <OptimizationSettings onSettingsChange={handleSettingsChange} />
            
            {isMounted && (
              <Terminal 
                settings={optimizationSettings} 
                onComplete={handleOptimizationComplete} 
              />
            )}
          </div>
          
          <div className="lg:col-span-1">
            <Tabs defaultValue="metrics" className="mb-6">
              <TabsList className="bg-gray-800 border border-gray-700 w-full">
                <TabsTrigger 
                  value="metrics" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400"
                >
                  Метрики
                </TabsTrigger>
                <TabsTrigger 
                  value="info" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-cyan-400"
                >
                  О программе
                </TabsTrigger>
              </TabsList>
              <TabsContent value="metrics" className="mt-4">
                <PerformanceMetrics />
              </TabsContent>
              <TabsContent value="info" className="mt-4">
                <div className="bg-gray-900 p-4 rounded border border-gray-800 text-gray-300 text-sm">
                  <h2 className="font-bold text-lg mb-2 text-cyan-400">О программе</h2>
                  <p className="mb-2">
                    Эта утилита выполняет комплексную оптимизацию Windows для улучшения производительности и скорости работы.
                  </p>
                  <p className="mb-2">
                    Включает в себя:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Оптимизацию сетевых параметров TCP/IP</li>
                    <li>Отключение фоновой активности браузеров</li>
                    <li>Очистку кэша и временных файлов</li>
                    <li>Настройку приоритетов процессов</li>
                    <li>Отключение ненужных служб Windows</li>
                  </ul>
                  <p className="mt-4 text-yellow-400">
                    Примечание: Для применения некоторых настроек может потребоваться перезагрузка компьютера.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
