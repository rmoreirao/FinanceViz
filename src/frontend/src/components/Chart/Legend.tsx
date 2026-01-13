/**
 * Chart Legend Component
 * 
 * TASK-025: Dynamic OHLCV legend on hover
 * 
 * Displays OHLCV values that update as the user hovers over the chart.
 * Positioned at top-left of chart.
 */

import { memo } from 'react';
import type { OHLCV } from '../../types';

interface LegendProps {
  data: OHLCV | null;
  symbol: string;
}

/**
 * Format price with 2 decimal places
 */
function formatPrice(value: number): string {
  return value.toFixed(2);
}

/**
 * Format volume with K/M/B suffixes
 */
function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  }
  return volume.toLocaleString();
}

/**
 * Legend component that displays OHLCV values
 */
export const Legend = memo(function Legend({ data, symbol }: LegendProps) {
  if (!data) {
    return (
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-gray-700 dark:text-gray-300">{symbol}</span>
        <span>Hover to see values</span>
      </div>
    );
  }

  const isBullish = data.close >= data.open;
  const changeColor = isBullish ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono">
      <span className="font-semibold text-gray-700 dark:text-gray-300">{symbol}</span>
      <span className="text-gray-600 dark:text-gray-400">
        O: <span className={changeColor}>{formatPrice(data.open)}</span>
      </span>
      <span className="text-gray-600 dark:text-gray-400">
        H: <span className={changeColor}>{formatPrice(data.high)}</span>
      </span>
      <span className="text-gray-600 dark:text-gray-400">
        L: <span className={changeColor}>{formatPrice(data.low)}</span>
      </span>
      <span className="text-gray-600 dark:text-gray-400">
        C: <span className={changeColor}>{formatPrice(data.close)}</span>
      </span>
      <span className="text-gray-600 dark:text-gray-400">
        Vol: <span className="text-gray-700 dark:text-gray-300">{formatVolume(data.volume)}</span>
      </span>
    </div>
  );
});

export default Legend;
