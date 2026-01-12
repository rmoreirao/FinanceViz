/**
 * Williams %R Calculation
 * Momentum indicator measuring overbought/oversold levels
 * Formula: %R = (Highest High - Close) / (Highest High - Lowest Low) × -100
 */

import type { OHLCV, WilliamsRParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Williams %R
 * @param data - OHLCV data array
 * @param params - Williams %R parameters (period)
 * @returns Array of Williams %R values (-100 to 0)
 */
export function calculateWilliamsR(data: OHLCV[], params: WilliamsRParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];

  if (data.length < period) {
    return result;
  }

  for (let i = period - 1; i < data.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = i - period + 1; j <= i; j++) {
      highestHigh = Math.max(highestHigh, data[j].high);
      lowestLow = Math.min(lowestLow, data[j].low);
    }

    const range = highestHigh - lowestLow;
    const willR = range === 0 ? -50 : ((highestHigh - data[i].close) / range) * -100;

    result.push({
      time: data[i].time,
      value: willR,
    });
  }

  return result;
}

/**
 * Williams %R indicator definition with metadata
 */
export const williamsRIndicator: IndicatorDefinition<WilliamsRParams, IndicatorValue> = {
  meta: {
    type: 'WILLR',
    name: 'Williams %R',
    shortName: 'W%R',
    category: 'oscillator',
    defaultParams: { period: 14 },
    defaultColor: '#9C27B0',
    description: 'Momentum indicator measuring overbought/oversold levels (-100 to 0)',
  },
  calculate: calculateWilliamsR,
};
