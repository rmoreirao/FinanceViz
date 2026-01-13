/**
 * ActiveIndicatorsList Component
 * List of currently active indicators with management controls
 * Features: Settings icon, visibility toggle, remove button
 */

import { useState, useCallback } from 'react';
import { Settings, Eye, EyeOff, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useIndicatorContext } from '../../context';
import { getIndicatorMeta } from './calculations';
import { IndicatorConfig } from './IndicatorConfig';
import type { Indicator } from '../../types';

interface ActiveIndicatorsListProps {
  className?: string;
}

export function ActiveIndicatorsList({ className = '' }: ActiveIndicatorsListProps) {
  const { state, removeIndicator, toggleIndicatorVisibility } = useIndicatorContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [configIndicator, setConfigIndicator] = useState<Indicator | null>(null);

  const allIndicators = [...state.overlays, ...state.oscillators];

  // Handle open config
  const handleOpenConfig = useCallback((indicator: Indicator) => {
    setConfigIndicator(indicator);
  }, []);

  // Handle close config
  const handleCloseConfig = useCallback(() => {
    setConfigIndicator(null);
  }, []);

  if (allIndicators.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active Indicators ({allIndicators.length})
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Indicator List */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {allIndicators.map((indicator) => {
              const meta = getIndicatorMeta(indicator.type);
              return (
                <div
                  key={indicator.id}
                  className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: indicator.color }}
                    />
                    <div>
                      <p className={`text-sm font-medium ${
                        indicator.visible 
                          ? 'text-gray-900 dark:text-gray-100' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {meta?.shortName || indicator.type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {meta?.category === 'overlay' ? 'Overlay' : 'Oscillator'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Settings */}
                    <button
                      onClick={() => handleOpenConfig(indicator)}
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    {/* Visibility Toggle */}
                    <button
                      onClick={() => toggleIndicatorVisibility(indicator.id)}
                      className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title={indicator.visible ? 'Hide' : 'Show'}
                    >
                      {indicator.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    {/* Remove */}
                    <button
                      onClick={() => removeIndicator(indicator.id)}
                      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Indicator Config Modal */}
      <IndicatorConfig
        indicator={configIndicator}
        isOpen={configIndicator !== null}
        onClose={handleCloseConfig}
      />
    </>
  );
}
