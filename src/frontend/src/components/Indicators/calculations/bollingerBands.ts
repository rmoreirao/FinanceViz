/**
 * Bollinger Bands Calculation
 * Upper Band = SMA + (stdDev × Standard Deviation)
 * Middle Band = SMA
 * Lower Band = SMA - (stdDev × Standard Deviation)
 */

import type { OHLCV, BollingerBandsParams } from '../../../types';
import type { BollingerBandsValue, IndicatorDefinition } from './types';

/**
 * Calculate standard deviation of an array of values
 */
function calculateStandardDeviation(values: number[], mean: number): number {
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate Bollinger Bands
 * @param data - OHLCV data array
 * @param params - Bollinger Bands parameters (period, stdDev)
 * @returns Array of Bollinger Bands values (upper, middle, lower)
 */
export function calculateBollingerBands(
  data: OHLCV[],
  params: BollingerBandsParams
): BollingerBandsValue[] {
  const { period, stdDev } = params;
  const result: BollingerBandsValue[] = [];
  
  if (data.length < period) {
    return result;
  }
  
  // Calculate Bollinger Bands for each valid point
  for (let i = period - 1; i < data.length; i++) {
    // Get closing prices for the period
    const closes: number[] = [];
    for (let j = 0; j < period; j++) {
      closes.push(data[i - j].close);
    }
    
    // Calculate SMA (middle band)
    const sma = closes.reduce((sum, val) => sum + val, 0) / period;
    
    // Calculate standard deviation
    const sd = calculateStandardDeviation(closes, sma);
    
    result.push({
      time: data[i].time,
      upper: sma + stdDev * sd,
      middle: sma,
      lower: sma - stdDev * sd,
    });
  }
  
  return result;
}

/**
 * Bollinger Bands indicator definition with metadata
 */
export const bollingerBandsIndicator: IndicatorDefinition<BollingerBandsParams, BollingerBandsValue> = {
  meta: {
    type: 'BB',
    name: 'Bollinger Bands',
    shortName: 'BB',
    category: 'overlay',
    defaultParams: { period: 20, stdDev: 2 },
    defaultColor: '#9C27B0',
    description: 'Volatility bands placed above and below a moving average',
    outputs: ['upper', 'middle', 'lower'],
  },
  calculate: calculateBollingerBands,
};
