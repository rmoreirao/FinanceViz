/**
 * Quote Header Component
 * Displays current stock quote information
 * 
 * TASK-014: Quote Header Component
 * TASK-069: Loading States - Skeleton loading and smooth transitions
 */

import { useChart } from '../../context';
import { useQuote } from '../../hooks';

/**
 * Skeleton loader for quote header
 */
function QuoteHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-colors duration-200">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 animate-pulse">
        {/* Symbol skeleton */}
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        
        {/* Company name skeleton */}
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        
        {/* Spacer */}
        <div className="hidden sm:block flex-grow" />
        
        {/* Price section skeleton */}
        <div className="flex items-baseline gap-3">
          <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
          <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        </div>
      </div>
      
      {/* Additional details skeleton */}
      <div className="hidden md:flex mt-2 gap-4 animate-pulse">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
        <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200" />
      </div>
    </div>
  );
}

/**
 * Format price with 2 decimal places
 */
function formatPrice(price: number): string {
  return price.toFixed(2);
}

/**
 * Format change with + or - prefix
 */
function formatChange(change: number): string {
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change.toFixed(2)}`;
}

/**
 * Format percentage change
 */
function formatPercent(percent: number): string {
  const prefix = percent >= 0 ? '+' : '';
  return `${prefix}${percent.toFixed(2)}%`;
}

/**
 * Quote Header displaying stock quote information
 * Shows symbol, company name, price, change, and change percentage
 * Color-coded: green for positive, red for negative
 */
export function QuoteHeader() {
  const { state } = useChart();
  const { quote, isLoading, error } = useQuote(state.symbol);

  // Loading state - show skeleton
  if (isLoading && !quote) {
    return <QuoteHeaderSkeleton />;
  }

  // Error state
  if (error && !quote) {
    return (
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-colors duration-200">
        <div className="text-red-500 dark:text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  // No data state
  if (!quote) {
    return null;
  }

  const isPositive = quote.change >= 0;
  const changeColorClass = isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-all duration-300 ease-in-out">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {/* Symbol */}
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
          {quote.symbol}
        </h1>

        {/* Company Name */}
        <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
          {quote.companyName}
        </span>

        {/* Spacer (hidden on small screens) */}
        <div className="hidden sm:block flex-grow" />

        {/* Price Section */}
        <div className="flex items-baseline gap-3">
          {/* Current Price */}
          <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
            ${formatPrice(quote.price)}
          </span>

          {/* Change (absolute) */}
          <span className={`text-base font-medium transition-colors duration-200 ${changeColorClass}`}>
            {formatChange(quote.change)}
          </span>

          {/* Change (percentage) */}
          <span className={`text-base font-medium transition-colors duration-200 ${changeColorClass}`}>
            ({formatPercent(quote.changePercent)})
          </span>
        </div>
      </div>

      {/* Additional Quote Details (optional, shown on larger screens) */}
      <div className="hidden md:flex mt-2 text-xs text-gray-500 dark:text-gray-400 gap-4 transition-colors duration-200">
        <span>
          <span className="font-medium">Open:</span> ${formatPrice(quote.open)}
        </span>
        <span>
          <span className="font-medium">High:</span> ${formatPrice(quote.high)}
        </span>
        <span>
          <span className="font-medium">Low:</span> ${formatPrice(quote.low)}
        </span>
        <span>
          <span className="font-medium">Prev Close:</span> ${formatPrice(quote.previousClose)}
        </span>
        <span>
          <span className="font-medium">Volume:</span> {quote.volume.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default QuoteHeader;
