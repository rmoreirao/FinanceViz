/**
 * Momentum Indicator Calculation
 * Measures the amount of price change over a specified period
 * Formula: Momentum = Close - Close N periods ago
 */

import type { OHLCV, MomentumParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Momentum
 * @param data - OHLCV data array
 * @param params - Momentum parameters (period)
 * @returns Array of Momentum values
 */
export function calculateMomentum(data: OHLCV[], params: MomentumParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];

  if (data.length <= period) {
    return result;
  }

  for (let i = period; i < data.length; i++) {
    const momentum = data[i].close - data[i - period].close;

    result.push({
      time: data[i].time,
      value: momentum,
    });
  }

  return result;
}

/**
 * Momentum indicator definition with metadata
 */
export const momentumIndicator: IndicatorDefinition<MomentumParams, IndicatorValue> = {
  meta: {
    type: 'MOM',
    name: 'Momentum',
    shortName: 'MOM',
    category: 'oscillator',
    defaultParams: { period: 10 },
    defaultColor: '#4CAF50',
    description: 'Measures price change over a specified period',
  },
  calculate: calculateMomentum,
};
