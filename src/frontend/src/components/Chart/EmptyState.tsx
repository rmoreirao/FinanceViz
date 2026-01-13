/**
 * Chart Empty State Component
 * 
 * TASK-028: Loading & Error States
 * 
 * Displays a "No data available" empty state when no chart data is found.
 */

import { memo } from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

/**
 * Empty state component for when no data is available
 */
export const EmptyState = memo(function EmptyState({
  title = 'No Data Available',
  message = 'No chart data found for the selected symbol and time range.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      {/* Chart icon */}
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
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {message}
      </p>
      
      {/* Suggestions */}
      <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
        <p>Try:</p>
        <ul className="mt-2 space-y-1">
          <li>• Selecting a different symbol</li>
          <li>• Changing the time range</li>
          <li>• Switching data source</li>
        </ul>
      </div>
    </div>
  );
});

export default EmptyState;
