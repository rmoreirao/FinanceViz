/**
 * Chart Legend Component
 * 
 * TASK-025: Dynamic OHLCV legend on hover
 * TASK-063: Indicator Legend Values
 * 
 * Displays OHLCV values that update as the user hovers over the chart.
 * Also shows active overlay indicator names.
 * Positioned at top-left of chart.
 */

import { memo } from 'react';
import type { OHLCV } from '../../types';
import type { OverlayIndicator } from '../../context/IndicatorContext';

interface LegendProps {
  data: OHLCV | null;
  symbol: string;
  overlays?: OverlayIndicator[];
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
 * Get display name for indicator type
 */
function getIndicatorShortName(type: string): string {
  const names: Record<string, string> = {
    sma: 'SMA',
    ema: 'EMA',
    wma: 'WMA',
    dema: 'DEMA',
    tema: 'TEMA',
    vwap: 'VWAP',
    bollingerBands: 'BB',
    envelope: 'ENV',
    parabolicSar: 'SAR',
    ichimoku: 'ICH',
  };
  return names[type] || type.toUpperCase();
}

/**
 * Get parameter value for display
 */
function getIndicatorParamDisplay(indicator: OverlayIndicator): string {
  const params = indicator.params as unknown as Record<string, unknown>;
  if ('period' in params) {
    return `${params.period}`;
  }
  if ('tenkanPeriod' in params) {
    return `${params.tenkanPeriod}/${params.kijunPeriod}/${params.senkouPeriod}`;
  }
  if ('step' in params) {
    return `${params.step}`;
  }
  return '';
}

/**
 * Legend component that displays OHLCV values and active indicators
 */
export const Legend = memo(function Legend({ data, symbol, overlays = [] }: LegendProps) {
  const visibleOverlays = overlays.filter((o) => o.visible);
  
  if (!data) {
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-300">{symbol}</span>
          <span>Hover to see values</span>
        </div>
        {visibleOverlays.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-mono">
            {visibleOverlays.map((indicator) => (
              <span
                key={indicator.id}
                className="inline-flex items-center gap-1"
                style={{ color: indicator.color }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: indicator.color }}
                />
                {getIndicatorShortName(indicator.type)}({getIndicatorParamDisplay(indicator)})
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isBullish = data.close >= data.open;
  const changeColor = isBullish ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-1">
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
      {visibleOverlays.length > 0 && (
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-mono">
          {visibleOverlays.map((indicator) => (
            <span
              key={indicator.id}
              className="inline-flex items-center gap-1"
              style={{ color: indicator.color }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: indicator.color }}
              />
              {getIndicatorShortName(indicator.type)}({getIndicatorParamDisplay(indicator)})
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

export default Legend;
