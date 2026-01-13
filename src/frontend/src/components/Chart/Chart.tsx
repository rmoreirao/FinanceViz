/**
 * Chart Container Component
 * Main chart wrapper with loading/error states
 * 
 * TASK-016: Chart Container Component
 * TASK-017: Candlestick Chart
 * TASK-028: Loading & Error States
 */

import { useRef } from 'react';
import { useChart } from '../../context';
import { useStockData, useChartResize } from '../../hooks';
import { ChartCanvas } from './ChartCanvas';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyState } from './EmptyState';

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
 * Loading overlay state (when data exists but new data is loading)
 */
function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10">
      <div className="relative">
        <div className="h-10 w-10 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 animate-spin" />
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
  const showSkeleton = isLoading && !hasData;
  const showError = error && !hasData;
  const showEmpty = !isLoading && !error && !hasData;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Loading overlay (when updating existing data) */}
      {isLoading && hasData && <LoadingOverlay />}
      
      {/* Skeleton loading state (initial load) */}
      {showSkeleton && <ChartSkeleton />}
      
      {/* Error state */}
      {showError && <ErrorState message={error} onRetry={refetch} />}
      
      {/* Empty state */}
      {showEmpty && <EmptyState />}
      
      {/* Chart canvas with actual chart */}
      {hasData && !showSkeleton && (
        <div className="w-full h-full flex flex-col">
          {/* Chart Canvas */}
          <div className="flex-1">
            <ChartCanvas
              data={data}
              chartType={chartType}
              width={dimensions.width}
              height={dimensions.height}
              symbol={symbol}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Chart;
