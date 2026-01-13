/**
 * Chart Type Selector Component
 * Dropdown to select chart visualization type
 * 
 * TASK-010: Chart Type Selector
 */

import { useState, useRef, useEffect } from 'react';
import { useChart } from '../../context';
import { CHART_TYPES, type ChartType } from '../../types';

/**
 * Chart type icons as SVG components
 */
const ChartIcons: Record<ChartType, JSX.Element> = {
  candlestick: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <rect x="4" y="6" width="3" height="12" rx="0.5" />
      <rect x="10.5" y="3" width="3" height="18" rx="0.5" />
      <rect x="17" y="8" width="3" height="8" rx="0.5" />
    </svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17l5-5 4 4 9-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  bar: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <rect x="4" y="4" width="2" height="16" />
      <rect x="11" y="8" width="2" height="8" />
      <rect x="18" y="6" width="2" height="12" />
    </svg>
  ),
  area: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" opacity="0.6">
      <path d="M3 20L3 17L8 12L12 16L21 5V20H3Z" />
    </svg>
  ),
  hollowCandle: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="6" width="3" height="12" rx="0.5" />
      <rect x="10.5" y="3" width="3" height="18" rx="0.5" />
      <rect x="17" y="8" width="3" height="8" rx="0.5" />
    </svg>
  ),
  heikinAshi: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <rect x="4" y="8" width="3" height="8" rx="0.5" opacity="0.7" />
      <rect x="10.5" y="5" width="3" height="14" rx="0.5" opacity="0.8" />
      <rect x="17" y="7" width="3" height="10" rx="0.5" opacity="0.9" />
    </svg>
  ),
  baseline: (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
      <path d="M3 12L8 8L12 10L16 6L21 9" fill="none" stroke="#22c55e" strokeWidth="2" />
      <path d="M3 12L8 15L12 13L16 17L21 14" fill="none" stroke="#ef4444" strokeWidth="2" />
    </svg>
  ),
};

/**
 * Chart Type Selector dropdown
 */
export function ChartTypeSelect() {
  const { state, setChartType } = useChart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentType = CHART_TYPES.find((t) => t.type === state.chartType);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (chartType: ChartType) => {
    setChartType(chartType);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative" data-testid="chart-type-select">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-500 dark:text-gray-400">
          {ChartIcons[state.chartType]}
        </span>
        <span className="hidden sm:inline">{currentType?.label}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <ul role="listbox" className="py-1">
            {CHART_TYPES.map((chartType) => {
              const isSelected = chartType.type === state.chartType;
              return (
                <li
                  key={chartType.type}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(chartType.type)}
                  className={`px-3 py-2 cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={isSelected ? 'text-blue-500' : 'text-gray-400'}>
                    {ChartIcons[chartType.type]}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">{chartType.label}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {chartType.description}
                    </span>
                  </div>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 ml-auto"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ChartTypeSelect;
