/**
 * QuoteHeader Component
 * Displays symbol, company name, current price, and change
 */

import { useChartContext } from '../../context';
import { useQuote } from '../../hooks';
import { formatPrice, formatPercent } from '../../utils';
import { Spinner } from '../common';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function QuoteHeader() {
  const { state } = useChartContext();
  const { quote, isLoading, error } = useQuote(state.symbol);

  if (error) {
    return (
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="text-red-500 text-sm">Failed to load quote: {error}</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center gap-4">
        {/* Symbol and Company Name */}
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {state.symbol}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {state.companyName}
          </p>
        </div>

        {/* Price Display */}
        {isLoading && !quote ? (
          <div className="flex items-center gap-2">
            <Spinner size="sm" />
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        ) : quote ? (
          <div className="flex items-center gap-4">
            {/* Current Price */}
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(quote.price)}
            </div>

            {/* Change */}
            <div
              className={`flex items-center gap-1 ${
                quote.change > 0
                  ? 'text-green-600 dark:text-green-500'
                  : quote.change < 0
                  ? 'text-red-600 dark:text-red-500'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {/* Trend Icon */}
              {quote.change > 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : quote.change < 0 ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <Minus className="w-5 h-5" />
              )}

              {/* Change Value */}
              <span className="text-lg font-semibold">
                {quote.change >= 0 ? '+' : ''}
                {formatPrice(quote.change)}
              </span>

              {/* Change Percent */}
              <span className="text-lg font-semibold">
                ({formatPercent(quote.changePercent)})
              </span>
            </div>

            {/* Loading indicator for refresh */}
            {isLoading && (
              <Spinner size="sm" />
            )}
          </div>
        ) : null}

        {/* Additional Info */}
        {quote && (
          <div className="hidden md:flex items-center gap-6 ml-auto text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="text-gray-400">Open:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {formatPrice(quote.open)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">High:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {formatPrice(quote.high)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Low:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {formatPrice(quote.low)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Prev Close:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {formatPrice(quote.previousClose)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
