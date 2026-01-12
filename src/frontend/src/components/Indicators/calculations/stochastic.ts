/**
 * Stochastic Oscillator Calculation
 * Compares closing price to price range over a period
 * Formula: %K = (Close - Lowest Low) / (Highest High - Lowest Low) × 100
 *          %D = SMA of %K
 */

import type { OHLCV, StochasticParams } from '../../../types';
import type { StochasticValue, IndicatorDefinition } from './types';

/**
 * Calculate Stochastic Oscillator
 * @param data - OHLCV data array
 * @param params - Stochastic parameters (kPeriod, dPeriod, smooth)
 * @returns Array of Stochastic values with %K and %D
 */
export function calculateStochastic(data: OHLCV[], params: StochasticParams): StochasticValue[] {
  const { kPeriod, dPeriod, smooth } = params;
  const result: StochasticValue[] = [];

  if (data.length < kPeriod + dPeriod + smooth - 2) {
    return result;
  }

  // Calculate raw %K values
  const rawK: number[] = [];
  for (let i = kPeriod - 1; i < data.length; i++) {
    let lowestLow = Infinity;
    let highestHigh = -Infinity;

    for (let j = i - kPeriod + 1; j <= i; j++) {
      lowestLow = Math.min(lowestLow, data[j].low);
      highestHigh = Math.max(highestHigh, data[j].high);
    }

    const range = highestHigh - lowestLow;
    const k = range === 0 ? 50 : ((data[i].close - lowestLow) / range) * 100;
    rawK.push(k);
  }

  // Apply smoothing to get %K (smooth raw %K with SMA)
  const smoothedK: number[] = [];
  for (let i = smooth - 1; i < rawK.length; i++) {
    let sum = 0;
    for (let j = i - smooth + 1; j <= i; j++) {
      sum += rawK[j];
    }
    smoothedK.push(sum / smooth);
  }

  // Calculate %D (SMA of smoothed %K)
  for (let i = dPeriod - 1; i < smoothedK.length; i++) {
    let sum = 0;
    for (let j = i - dPeriod + 1; j <= i; j++) {
      sum += smoothedK[j];
    }
    const d = sum / dPeriod;

    const dataIndex = kPeriod - 1 + smooth - 1 + i;
    if (dataIndex < data.length) {
      result.push({
        time: data[dataIndex].time,
        k: smoothedK[i],
        d,
      });
    }
  }

  return result;
}

/**
 * Stochastic Oscillator indicator definition with metadata
 */
export const stochasticIndicator: IndicatorDefinition<StochasticParams, StochasticValue> = {
  meta: {
    type: 'STOCH',
    name: 'Stochastic Oscillator',
    shortName: 'Stoch',
    category: 'oscillator',
    defaultParams: { kPeriod: 14, dPeriod: 3, smooth: 3 },
    defaultColor: '#FF5722',
    description: 'Momentum indicator comparing closing price to price range (0-100)',
    outputs: ['k', 'd'],
  },
  calculate: calculateStochastic,
};
