/**
 * Aroon Indicator Calculation
 * Identifies trend changes and trend strength
 * Aroon Up = ((Period - Days Since Highest High) / Period) × 100
 * Aroon Down = ((Period - Days Since Lowest Low) / Period) × 100
 */

import type { OHLCV, AroonParams } from '../../../types';
import type { AroonValue, IndicatorDefinition } from './types';

/**
 * Calculate Aroon Indicator
 * @param data - OHLCV data array
 * @param params - Aroon parameters (period)
 * @returns Array of Aroon values with aroonUp and aroonDown
 */
export function calculateAroon(data: OHLCV[], params: AroonParams): AroonValue[] {
  const { period } = params;
  const result: AroonValue[] = [];

  if (data.length < period + 1) {
    return result;
  }

  for (let i = period; i < data.length; i++) {
    let highestHighIndex = i - period;
    let lowestLowIndex = i - period;
    let highestHigh = data[i - period].high;
    let lowestLow = data[i - period].low;

    // Find highest high and lowest low in the period
    for (let j = i - period; j <= i; j++) {
      if (data[j].high >= highestHigh) {
        highestHigh = data[j].high;
        highestHighIndex = j;
      }
      if (data[j].low <= lowestLow) {
        lowestLow = data[j].low;
        lowestLowIndex = j;
      }
    }

    // Calculate days since highest high and lowest low
    const daysSinceHigh = i - highestHighIndex;
    const daysSinceLow = i - lowestLowIndex;

    // Calculate Aroon Up and Down
    const aroonUp = ((period - daysSinceHigh) / period) * 100;
    const aroonDown = ((period - daysSinceLow) / period) * 100;

    result.push({
      time: data[i].time,
      aroonUp,
      aroonDown,
    });
  }

  return result;
}

/**
 * Aroon indicator definition with metadata
 */
export const aroonIndicator: IndicatorDefinition<AroonParams, AroonValue> = {
  meta: {
    type: 'AROON',
    name: 'Aroon',
    shortName: 'Aroon',
    category: 'oscillator',
    defaultParams: { period: 25 },
    defaultColor: '#00BCD4',
    description: 'Identifies trend changes and measures trend strength (0-100)',
    outputs: ['aroonUp', 'aroonDown'],
  },
  calculate: calculateAroon,
};
