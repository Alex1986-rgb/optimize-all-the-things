
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
    return !!window.electronAPI;
  } catch (e) {
    return false;
  }
};

// Helper to calculate improvement percentage
export const calculateImprovement = (
  current: number | string,
  before: number | string,
  higher: boolean = false
): { improvement: number; improved: boolean } => {
  const currentValue = typeof current === 'string' ? parseFloat(current) : current;
  const beforeValue = typeof before === 'string' ? parseFloat(before) : before;
  
  let improvement = 0;
  let improved = false;
  
  if (before > 0) {
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
