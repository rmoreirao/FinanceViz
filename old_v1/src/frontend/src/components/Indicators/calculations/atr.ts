/**
 * ATR (Average True Range) Calculation
 * Measures market volatility
 * True Range = max(High-Low, abs(High-PrevClose), abs(Low-PrevClose))
 * ATR = Smoothed average of True Range
 */

import type { OHLCV, ATRParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate True Range for a single bar
 */
function calculateTrueRange(current: OHLCV, previous: OHLCV): number {
  const highLow = current.high - current.low;
  const highPrevClose = Math.abs(current.high - previous.close);
  const lowPrevClose = Math.abs(current.low - previous.close);
  return Math.max(highLow, highPrevClose, lowPrevClose);
}

/**
 * Calculate Average True Range
 * @param data - OHLCV data array
 * @param params - ATR parameters (period)
 * @returns Array of ATR values
 */
export function calculateATR(data: OHLCV[], params: ATRParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];

  if (data.length < period + 1) {
    return result;
  }

  // Calculate True Range values
  const trueRanges: number[] = [];
  for (let i = 1; i < data.length; i++) {
    trueRanges.push(calculateTrueRange(data[i], data[i - 1]));
  }

  // Calculate first ATR as simple average of first N true ranges
  let atr = 0;
  for (let i = 0; i < period; i++) {
    atr += trueRanges[i];
  }
  atr /= period;

  result.push({
    time: data[period].time,
    value: atr,
  });

  // Calculate remaining ATR values using Wilder's smoothing
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
    result.push({
      time: data[i + 1].time,
      value: atr,
    });
  }

  return result;
}

/**
 * ATR indicator definition with metadata
 */
export const atrIndicator: IndicatorDefinition<ATRParams, IndicatorValue> = {
  meta: {
    type: 'ATR',
    name: 'Average True Range',
    shortName: 'ATR',
    category: 'oscillator',
    defaultParams: { period: 14 },
    defaultColor: '#795548',
    description: 'Measures market volatility based on true range',
  },
  calculate: calculateATR,
};
