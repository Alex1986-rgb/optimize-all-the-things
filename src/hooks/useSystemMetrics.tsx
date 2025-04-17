
import { useState, useEffect } from 'react';
import { simulatedData, checkIsElectron, getAppVersionSync } from '@/utils/metricsUtils';

interface MetricsState {
  cpu: number;
  memory: number;
  temperature: number;
  networkSpeed: string;
  timestamp: number;
}

export const useSystemMetrics = (optimizationComplete: boolean = false) => {
  const [metrics, setMetrics] = useState<MetricsState>({
    cpu: 0,
    memory: 0,
    temperature: 0,
    networkSpeed: '0',
    timestamp: Date.now()
  });
  
  const [beforeOptimization, setBeforeOptimization] = useState<MetricsState>({
    cpu: 0,
    memory: 0,
    temperature: 0,
    networkSpeed: '0',
    timestamp: Date.now()
  });

  const [isElectron, setIsElectron] = useState(false);

  // Check if running in Electron
  useEffect(() => {
    setIsElectron(checkIsElectron());
  }, []);

  // Get metrics from Electron API or simulate them
  useEffect(() => {
    if (!isElectron) {
      // Simulate data for web environment
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
      // Save initial metrics values
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
              networkSpeed: network.toString(),
              timestamp: Date.now()
            });
          });
        } catch (error) {
          console.error('Failed to get initial metrics:', error);
        }
      }
      
      // Subscribe to metrics updates from Electron
      const unsubscribe = window.electronAPI.onSystemMetrics((data) => {
        // Parse string values to numbers for internal state management
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

  return { metrics, beforeOptimization, isElectron };
};
