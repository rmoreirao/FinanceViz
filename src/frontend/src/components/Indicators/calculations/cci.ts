/**
 * CCI (Commodity Channel Index) Calculation
 * Measures current price level relative to an average price level
 * Formula: CCI = (Typical Price - SMA of TP) / (0.015 × Mean Deviation)
 */

import type { OHLCV, CCIParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Commodity Channel Index
 * @param data - OHLCV data array
 * @param params - CCI parameters (period)
 * @returns Array of CCI values
 */
export function calculateCCI(data: OHLCV[], params: CCIParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];

  if (data.length < period) {
    return result;
  }

  // Calculate typical prices: (High + Low + Close) / 3
  const typicalPrices = data.map(d => (d.high + d.low + d.close) / 3);

  for (let i = period - 1; i < data.length; i++) {
    // Calculate SMA of typical price
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += typicalPrices[j];
    }
    const sma = sum / period;

    // Calculate mean deviation
    let meanDeviation = 0;
    for (let j = i - period + 1; j <= i; j++) {
      meanDeviation += Math.abs(typicalPrices[j] - sma);
    }
    meanDeviation /= period;

    // Calculate CCI
    // Lambert's constant of 0.015 ensures ~70-80% of values fall between +100 and -100
    const cci = meanDeviation === 0 ? 0 : (typicalPrices[i] - sma) / (0.015 * meanDeviation);

    result.push({
      time: data[i].time,
      value: cci,
    });
  }

  return result;
}

/**
 * CCI indicator definition with metadata
 */
export const cciIndicator: IndicatorDefinition<CCIParams, IndicatorValue> = {
  meta: {
    type: 'CCI',
    name: 'Commodity Channel Index',
    shortName: 'CCI',
    category: 'oscillator',
    defaultParams: { period: 20 },
    defaultColor: '#00BCD4',
    description: 'Measures price deviation from statistical mean',
  },
  calculate: calculateCCI,
};
