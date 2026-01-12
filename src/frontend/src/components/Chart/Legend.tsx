/**
 * Legend Component
 * Displays OHLCV values for hovered bar
 * Updates on crosshair move event
 * Format values appropriately
 */

import type { CrosshairData, OHLCV } from '../../types';
import { formatPrice, formatVolume, formatDate } from '../../utils';

interface LegendProps {
  crosshairData: CrosshairData | null;
  latestData: OHLCV | null;
  symbol?: string;
}

export function Legend({ crosshairData, latestData, symbol }: LegendProps) {
  // Use crosshair data if available, otherwise use latest data
  const displayData = crosshairData || (latestData ? {
    time: latestData.time,
    open: latestData.open,
    high: latestData.high,
    low: latestData.low,
    close: latestData.close,
    volume: latestData.volume,
  } : null);

  if (!displayData) {
    return null;
  }

  // Calculate price change from open
  const priceChange = displayData.close - displayData.open;
  const priceChangePercent = ((priceChange / displayData.open) * 100);
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-md px-3 py-2 text-sm shadow-sm">
      {/* Symbol and Date */}
      <div className="flex items-center gap-2 mb-1">
        {symbol && (
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {symbol}
          </span>
        )}
        <span className="text-gray-500 dark:text-gray-400">
          {formatDate(displayData.time)}
        </span>
      </div>

      {/* OHLCV Values */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span>
          <span className="text-gray-500 dark:text-gray-400">O:</span>{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatPrice(displayData.open)}
          </span>
        </span>
        <span>
          <span className="text-gray-500 dark:text-gray-400">H:</span>{' '}
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatPrice(displayData.high)}
          </span>
        </span>
        <span>
          <span className="text-gray-500 dark:text-gray-400">L:</span>{' '}
          <span className="font-medium text-red-600 dark:text-red-400">
            {formatPrice(displayData.low)}
          </span>
        </span>
        <span>
          <span className="text-gray-500 dark:text-gray-400">C:</span>{' '}
          <span className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatPrice(displayData.close)}
          </span>
        </span>
        <span>
          <span className="text-gray-500 dark:text-gray-400">Vol:</span>{' '}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatVolume(displayData.volume)}
          </span>
        </span>
        <span className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? '+' : ''}{formatPrice(priceChange)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
