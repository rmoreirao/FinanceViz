/**
 * Chart Skeleton Component
 * 
 * TASK-028: Loading & Error States
 * TASK-069: Loading States - Enhanced skeletons with smooth transitions
 * 
 * Displays a skeleton loader while chart data is loading.
 * Provides a visual placeholder that mimics the chart structure.
 */

import { memo } from 'react';

interface ChartSkeletonProps {
  message?: string;
  showSpinner?: boolean;
}

/**
 * Skeleton loader for chart loading state
 * Features smooth pulse animation and realistic chart structure
 */
export const ChartSkeleton = memo(function ChartSkeleton({ 
  message = 'Loading chart data...',
  showSpinner = true
}: ChartSkeletonProps) {
  return (
    <div className="flex flex-col h-full w-full transition-opacity duration-300 ease-in-out">
      {/* Skeleton header bar with legend placeholders */}
      <div className="flex items-center gap-4 p-4 animate-pulse">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
      </div>
      
      {/* Skeleton chart area */}
      <div className="flex-1 p-4 space-y-2">
        {/* Y-axis skeleton */}
        <div className="flex h-full">
          <div className="flex flex-col justify-between pr-2 animate-pulse">
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
          </div>
          
          {/* Chart area skeleton with candlestick-like bars */}
          <div className="flex-1 flex flex-col justify-center items-center">
            {/* Animated candlestick placeholders */}
            <div className="flex items-end justify-center gap-1 w-full h-48 animate-pulse">
              {Array.from({ length: 30 }).map((_, i) => {
                // Create pseudo-random but stable heights
                const height = 20 + ((i * 7 + 13) % 60);
                const opacity = 0.4 + ((i * 3) % 40) / 100;
                return (
                  <div
                    key={i}
                    className="w-2 bg-gray-200 dark:bg-gray-700 rounded transition-all duration-300"
                    style={{ 
                      height: `${height}%`,
                      opacity,
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                );
              })}
            </div>
            
            {/* Volume bar placeholders */}
            <div className="flex items-end justify-center gap-1 w-full h-12 mt-4 animate-pulse">
              {Array.from({ length: 30 }).map((_, i) => {
                const height = 10 + ((i * 11 + 7) % 50);
                return (
                  <div
                    key={i}
                    className="w-2 bg-gray-200 dark:bg-gray-700 rounded-t transition-colors duration-200"
                    style={{ 
                      height: `${height}%`,
                      opacity: 0.3 + ((i * 5) % 30) / 100
                    }}
                  />
                );
              })}
            </div>
            
            {/* Loading message and spinner */}
            {showSpinner && (
              <div className="mt-8 flex flex-col items-center transition-opacity duration-300">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 animate-spin" />
                </div>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* X-axis skeleton */}
      <div className="flex justify-between px-12 pb-4 animate-pulse">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
      </div>
    </div>
  );
});

export default ChartSkeleton;
