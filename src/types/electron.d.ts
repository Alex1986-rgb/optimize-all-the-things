
// Типы для Electron API
interface ElectronAPI {
  getCpuUsage: () => Promise<number>;
  getMemoryUsage: () => Promise<number>;
  getTemperature: () => Promise<number>;
  getNetworkSpeed: () => Promise<number>;
  runOptimization: (settings: OptimizationSettings) => Promise<{ success: boolean; message: string, improvements?: any }>;
  onSystemMetrics: (callback: (data: SystemMetrics) => void) => () => void;
  onAdminRightsWarning: (callback: (data: any) => void) => () => void;
  getAppVersion: () => Promise<string>;
  showLogs: () => Promise<void>;
  setAutostart: (enabled: boolean) => Promise<boolean>;
  checkForUpdates: () => Promise<void>;
}

interface SystemMetrics {
  cpu: string;
  memory: string;
  temperature: string;
  networkSpeed: string;
  timestamp: number;
}

interface OptimizationSettings {
  cleanup: boolean;
  network: boolean;
  browsers: boolean;
  services: boolean;
  priority: boolean;
  startup: boolean;
  gaming: boolean;
  privacy: boolean;
}

interface Window {
  electronAPI: ElectronAPI;
}
