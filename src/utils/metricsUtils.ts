
// Utility functions for metrics calculations and data handling

// Симулированные данные для веб-среды
export const simulatedData = {
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

// Function to determine if running in Electron environment
export const checkIsElectron = (): boolean => {
  try {
    // Fix the type error by checking window.process existence without accessing 'type'
    return window && window.process && 'electron' in process.versions || !!window.electronAPI;
  } catch (e) {
    console.warn('Error checking Electron environment:', e);
    return false;
  }
};

// Helper to safely parse numeric values
const safeParseNumber = (value: number | string): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper to calculate improvement percentage
export const calculateImprovement = (
  current: number | string,
  before: number | string,
  higher: boolean = false
): { improvement: number; improved: boolean } => {
  const currentValue = safeParseNumber(current);
  const beforeValue = safeParseNumber(before);
  
  let improvement = 0;
  let improved = false;
  
  if (beforeValue > 0) {
    if (higher) {
      improvement = Math.round((currentValue - beforeValue) / beforeValue * 100);
      improved = improvement > 0;
    } else {
      improvement = Math.round((beforeValue - currentValue) / beforeValue * 100);
      improved = improvement > 0;
    }
  }
  
  return { improvement, improved };
};

// Helper to format file sizes
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

// Get application version asynchronously
export const getAppVersion = async (): Promise<string> => {
  if (checkIsElectron() && window.electronAPI) {
    try {
      // Check if getAppVersion exists on window.electronAPI before calling it
      if ('getAppVersion' in window.electronAPI) {
        const version = await window.electronAPI.getAppVersion();
        return version || '1.0.0';
      }
    } catch (e) {
      console.warn('Error getting app version:', e);
    }
  }
  return '1.0.0'; // Fallback version
};

// Synchronous version for backwards compatibility
export const getAppVersionSync = (): string => {
  return '1.0.0'; // Fallback version for synchronous calls
};
