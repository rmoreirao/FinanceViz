/**
 * Chart Container Component
 * Main chart wrapper with loading/error states
 * 
 * TASK-016: Chart Container Component
 */

import { useRef } from 'react';
import { useChart } from '../../context';
import { useStockData, useChartResize } from '../../hooks';
import { Spinner } from '../common';

/**
 * Error state component with retry button
 */
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <svg
        className="w-16 h-16 text-red-400 dark:text-red-500 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Error Loading Chart
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
      >
        Try Again
      </button>
    </div>
  );
}

/**
 * Empty state when no data is available
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <svg
        className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        No Data Available
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No chart data found for the selected symbol and time range.
      </p>
    </div>
  );
}

/**
 * Loading state with spinner overlay
 */
function LoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10">
      <div className="flex flex-col items-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Loading chart data...
        </p>
      </div>
    </div>
  );
}

/**
 * Main Chart Container Component
 * Manages data fetching, resizing, and renders appropriate states
 */
export function Chart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = useChart();
  const { symbol, timeRange, interval, chartType } = state;
  
  const { data, isLoading, error, refetch } = useStockData(symbol, timeRange, interval);
  const dimensions = useChartResize(containerRef);

  // Determine what to render
  const hasData = data.length > 0;
  const showLoading = isLoading && !hasData;
  const showError = error && !hasData;
  const showEmpty = !isLoading && !error && !hasData;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Loading overlay */}
      {isLoading && hasData && <LoadingState />}
      
      {/* Full loading state */}
      {showLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Loading chart data...
            </p>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {showError && <ErrorState message={error} onRetry={refetch} />}
      
      {/* Empty state */}
      {showEmpty && <EmptyState />}
      
      {/* Chart canvas placeholder - will be implemented in TASK-017 */}
      {hasData && !showLoading && (
        <div className="w-full h-full flex flex-col">
          {/* Chart info overlay */}
          <div className="absolute top-2 left-2 z-10 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
            {symbol} • {chartType} • {timeRange} • {interval}
          </div>
          
          {/* Placeholder for ChartCanvas */}
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg 
                className="w-12 h-12 mx-auto mb-3 opacity-50" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" 
                />
              </svg>
              <p className="font-medium">Chart Canvas Ready</p>
              <p className="text-sm mt-1">
                {data.length} data points loaded
              </p>
              <p className="text-xs mt-1 opacity-75">
                Dimensions: {dimensions.width}x{dimensions.height}px
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chart;
