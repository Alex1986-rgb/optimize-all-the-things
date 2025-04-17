
import React from 'react';
import { calculateImprovement } from '@/utils/metricsUtils';

interface MetricItemProps {
  currentValue: number | string;
  beforeValue: number | string;
  label: string;
  icon: JSX.Element;
  unit: string;
  higher?: boolean;
  optimizationComplete: boolean;
}

const MetricItem: React.FC<MetricItemProps> = ({
  currentValue,
  beforeValue,
  label,
  icon,
  unit,
  higher = false,
  optimizationComplete
}) => {
  const { improvement, improved } = calculateImprovement(currentValue, beforeValue, higher);
  
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

export default MetricItem;
