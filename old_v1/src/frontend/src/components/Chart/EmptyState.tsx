/**
 * EmptyState Component
 * Displays when no symbol is selected or no data is available
 * Prompts user to search for a symbol
 */

import { Search, TrendingUp } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-symbol' | 'no-data';
  symbol?: string;
  message?: string;
}

export function EmptyState({ type = 'no-symbol', symbol, message }: EmptyStateProps) {
  if (type === 'no-data') {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-6 text-center px-4 max-w-md">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-gray-400" />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              No data available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {message || `No chart data available for ${symbol || 'this symbol'} with the selected time range.`}
            </p>
          </div>

          {/* Suggestions */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Try:</p>
            <ul className="mt-2 space-y-1">
              <li>• Selecting a different time range</li>
              <li>• Checking if the market is open</li>
              <li>• Searching for a different symbol</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Default: no-symbol state
  return (
    <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-6 text-center px-4 max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <Search className="w-10 h-10 text-blue-500" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Search for a stock
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Enter a stock symbol in the search box above to view its chart and technical indicators.
          </p>
        </div>

        {/* Popular symbols */}
        <div className="w-full">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Popular symbols:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META'].map((sym) => (
              <span
                key={sym}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
              >
                {sym}
              </span>
            ))}
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 font-mono">/</kbd> to focus search
        </p>
      </div>
    </div>
  );
}
