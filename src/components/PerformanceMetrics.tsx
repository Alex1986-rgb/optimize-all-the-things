
import React, { useState, useEffect } from 'react';
import { CircleDot, Cpu, HardDrive, Thermometer, Wifi, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PerformanceMetricsProps {
  optimizationComplete?: boolean;
}

// Симулированные данные для веб-среды
const simulatedData = {
  beforeOptimization: {
    cpu: 45,
    memory: 68,
    temperature: 72,
    networkSpeed: 34,
    diskUsage: 85
  },
  afterOptimization: {
    cpu: 28,
    memory: 45,
    temperature: 65,
    networkSpeed: 48,
    diskUsage: 62
  }
};

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ optimizationComplete = false }) => {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    temperature: 0,
    networkSpeed: '0',
    timestamp: Date.now()
  });
  
  const [beforeOptimization, setBeforeOptimization] = useState({
    cpu: 0,
    memory: 0,
    temperature: 0,
    networkSpeed: '0'
  });

  const [isElectron, setIsElectron] = useState(false);

  // Проверка, запущено ли в Electron
  useEffect(() => {
    try {
      setIsElectron(!!window.electronAPI);
    } catch (e) {
      setIsElectron(false);
      console.info('Not running in Electron environment, using simulated data');
    }
  }, []);

  // Получение метрик из Electron API
  useEffect(() => {
    if (!isElectron) {
      // Симуляция данных для веб-среды
      const timer = setInterval(() => {
        const data = optimizationComplete ? simulatedData.afterOptimization : simulatedData.beforeOptimization;
        setMetrics({
          cpu: data.cpu + (Math.random() * 5 - 2.5),
          memory: data.memory + (Math.random() * 5 - 2.5),
          temperature: data.temperature + (Math.random() * 3 - 1.5),
          networkSpeed: Math.ceil(data.networkSpeed + (Math.random() * 10 - 5)).toString(),
          timestamp: Date.now()
        });
      }, 2000);
      
      return () => clearInterval(timer);
    } else {
      // Сохраняем начальные значения метрик
      if (!optimizationComplete) {
        try {
          Promise.all([
            window.electronAPI.getCpuUsage(),
            window.electronAPI.getMemoryUsage(),
            window.electronAPI.getTemperature(),
            window.electronAPI.getNetworkSpeed()
          ]).then(([cpu, memory, temp, network]) => {
            setBeforeOptimization({
              cpu,
              memory,
              temperature: temp,
              networkSpeed: network.toString()
            });
          });
        } catch (error) {
          console.error('Failed to get initial metrics:', error);
        }
      }
      
      // Основные обновления метрик
      const unsubscribe = window.electronAPI.onSystemMetrics((data) => {
        // Convert string values to numbers where appropriate
        setMetrics({
          cpu: parseFloat(data.cpu),
          memory: parseFloat(data.memory),
          temperature: parseFloat(data.temperature),
          networkSpeed: data.networkSpeed,
          timestamp: data.timestamp
        });
      });
      
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [isElectron, optimizationComplete]);

  // Функция для отображения метрики с улучшением
  const renderMetricWithImprovement = (
    currentValue: number | string, 
    beforeValue: number | string, 
    label: string, 
    icon: JSX.Element, 
    unit: string,
    higher: boolean = false
  ) => {
    const current = typeof currentValue === 'string' ? parseFloat(currentValue) : currentValue;
    const before = typeof beforeValue === 'string' ? parseFloat(beforeValue) : beforeValue;
    
    let improvement = 0;
    let improved = false;
    
    if (optimizationComplete && before > 0) {
      if (higher) {
        improvement = Math.round((current - before) / before * 100);
        improved = improvement > 0;
      } else {
        improvement = Math.round((before - current) / before * 100);
        improved = improvement > 0;
      }
    }
    
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 mb-3">
        <div className="flex items-center">
          <div className="text-cyan-400 mr-3">{icon}</div>
          <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-lg font-bold text-gray-100">
              {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue} {unit}
            </p>
          </div>
        </div>
        
        {optimizationComplete && improvement !== 0 && (
          <div className={`text-xs font-bold ${improved ? 'text-green-500' : 'text-red-500'}`}>
            {improved ? '▲' : '▼'} {Math.abs(improvement)}%
          </div>
        )}
      </div>
    );
  };

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
        {renderMetricWithImprovement(
          metrics.cpu, 
          beforeOptimization.cpu, 
          'Загрузка процессора', 
          <Cpu size={20} />, 
          '%'
        )}
        
        {renderMetricWithImprovement(
          metrics.memory, 
          beforeOptimization.memory, 
          'Использование памяти', 
          <HardDrive size={20} />, 
          '%'
        )}
        
        {renderMetricWithImprovement(
          metrics.temperature, 
          beforeOptimization.temperature, 
          'Температура CPU', 
          <Thermometer size={20} />, 
          '°C'
        )}
        
        {renderMetricWithImprovement(
          metrics.networkSpeed, 
          beforeOptimization.networkSpeed, 
          'Скорость сети', 
          <Wifi size={20} />, 
          'Мб/с',
          true
        )}
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
