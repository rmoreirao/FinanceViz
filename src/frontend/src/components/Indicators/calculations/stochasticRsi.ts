/**
 * Stochastic RSI Calculation
 * Applies Stochastic formula to RSI values instead of price
 * Formula: StochRSI = (RSI - Lowest RSI) / (Highest RSI - Lowest RSI)
 */

import type { OHLCV, StochasticRSIParams } from '../../../types';
import type { StochasticValue, IndicatorDefinition } from './types';
import { calculateRSI } from './rsi';

/**
 * Calculate Stochastic RSI
 * @param data - OHLCV data array
 * @param params - StochRSI parameters (rsiPeriod, stochPeriod)
 * @returns Array of StochRSI values with %K and %D
 */
export function calculateStochasticRSI(data: OHLCV[], params: StochasticRSIParams): StochasticValue[] {
  const { rsiPeriod, stochPeriod } = params;
  const result: StochasticValue[] = [];

  // First calculate RSI
  const rsiValues = calculateRSI(data, { period: rsiPeriod });

  if (rsiValues.length < stochPeriod) {
    return result;
  }

  // Extract just the values for stochastic calculation
  const rsiNums = rsiValues.map(r => r.value);

  // Calculate Stochastic of RSI
  const stochK: { time: number; k: number }[] = [];
  for (let i = stochPeriod - 1; i < rsiNums.length; i++) {
    let lowestRSI = Infinity;
    let highestRSI = -Infinity;

    for (let j = i - stochPeriod + 1; j <= i; j++) {
      lowestRSI = Math.min(lowestRSI, rsiNums[j]);
      highestRSI = Math.max(highestRSI, rsiNums[j]);
    }

    const range = highestRSI - lowestRSI;
    const k = range === 0 ? 50 : ((rsiNums[i] - lowestRSI) / range) * 100;
    stochK.push({
      time: rsiValues[i].time,
      k,
    });
  }

  // Calculate %D (3-period SMA of %K)
  const dPeriod = 3;
  for (let i = dPeriod - 1; i < stochK.length; i++) {
    let sum = 0;
    for (let j = i - dPeriod + 1; j <= i; j++) {
      sum += stochK[j].k;
    }
    const d = sum / dPeriod;

    result.push({
      time: stochK[i].time,
      k: stochK[i].k,
      d,
    });
  }

  return result;
}

/**
 * Stochastic RSI indicator definition with metadata
 */
export const stochasticRsiIndicator: IndicatorDefinition<StochasticRSIParams, StochasticValue> = {
  meta: {
    type: 'STOCHRSI',
    name: 'Stochastic RSI',
    shortName: 'StochRSI',
    category: 'oscillator',
    defaultParams: { rsiPeriod: 14, stochPeriod: 14 },
    defaultColor: '#E91E63',
    description: 'Stochastic oscillator applied to RSI values (0-100)',
    outputs: ['k', 'd'],
  },
  calculate: calculateStochasticRSI,
};
