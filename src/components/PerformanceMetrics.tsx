
import React from 'react';
import { CircleDot, Cpu, HardDrive, Thermometer, Wifi, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import MetricItem from './metrics/MetricItem';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';

interface PerformanceMetricsProps {
  optimizationComplete?: boolean;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ optimizationComplete = false }) => {
  const { metrics, beforeOptimization, isElectron } = useSystemMetrics(optimizationComplete);

  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-lg font-semibold flex items-center">
          <Activity size={20} className="text-cyan-400 mr-2" />
          Системные метрики
        </h2>
        <div className="flex items-center">
          <CircleDot size={12} className="text-green-500 mr-1 animate-pulse" />
          <span className="text-xs text-green-500">
            {optimizationComplete ? 'После оптимизации' : 'Мониторинг...'}
          </span>
        </div>
      </div>
      
      <div className="space-y-1">
        <MetricItem
          currentValue={metrics.cpu}
          beforeValue={beforeOptimization.cpu}
          label="Загрузка процессора"
          icon={<Cpu size={20} />}
          unit="%"
          optimizationComplete={optimizationComplete}
        />
        
        <MetricItem
          currentValue={metrics.memory}
          beforeValue={beforeOptimization.memory}
          label="Использование памяти"
          icon={<HardDrive size={20} />}
          unit="%"
          optimizationComplete={optimizationComplete}
        />
        
        <MetricItem
          currentValue={metrics.temperature}
          beforeValue={beforeOptimization.temperature}
          label="Температура CPU"
          icon={<Thermometer size={20} />}
          unit="°C"
          optimizationComplete={optimizationComplete}
        />
        
        <MetricItem
          currentValue={metrics.networkSpeed}
          beforeValue={beforeOptimization.networkSpeed}
          label="Скорость сети"
          icon={<Wifi size={20} />}
          unit="Мб/с"
          higher={true}
          optimizationComplete={optimizationComplete}
        />
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500 flex justify-between items-center">
        <span>Обновлено: {new Date(metrics.timestamp).toLocaleTimeString()}</span>
        {!isElectron && (
          <span className="text-amber-500">Симуляция данных (веб-режим)</span>
        )}
      </div>
    </Card>
  );
};

export default PerformanceMetrics;
