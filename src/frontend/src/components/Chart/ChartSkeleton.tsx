/**
 * Chart Skeleton Component
 * 
 * TASK-028: Loading & Error States
 * 
 * Displays a skeleton loader while chart data is loading.
 * Provides a visual placeholder that mimics the chart structure.
 */

import { memo } from 'react';

interface ChartSkeletonProps {
  message?: string;
}

/**
 * Skeleton loader for chart loading state
 */
export const ChartSkeleton = memo(function ChartSkeleton({ 
  message = 'Loading chart data...' 
}: ChartSkeletonProps) {
  return (
    <div className="flex flex-col h-full w-full animate-pulse">
      {/* Skeleton header bar */}
      <div className="flex items-center gap-4 p-4">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      
      {/* Skeleton chart area */}
      <div className="flex-1 p-4 space-y-2">
        {/* Y-axis skeleton */}
        <div className="flex h-full">
          <div className="flex flex-col justify-between pr-2">
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          
          {/* Chart area skeleton */}
          <div className="flex-1 flex flex-col justify-center items-center">
            {/* Candlestick-like bars */}
            <div className="flex items-end justify-center gap-1 w-full h-48">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-gray-200 dark:bg-gray-700 rounded"
                  style={{ 
                    height: `${Math.random() * 80 + 20}%`,
                    opacity: 0.5 + Math.random() * 0.5
                  }}
                />
              ))}
            </div>
            
            {/* Loading message */}
            <div className="mt-8 flex flex-col items-center">
              <div className="relative">
                <div className="h-10 w-10 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 animate-spin" />
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* X-axis skeleton */}
      <div className="flex justify-between px-12 pb-4">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
});

export default ChartSkeleton;
