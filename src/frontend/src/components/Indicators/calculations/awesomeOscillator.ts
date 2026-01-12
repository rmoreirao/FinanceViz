/**
 * Awesome Oscillator Calculation
 * Measures market momentum
 * Formula: AO = SMA(Median Price, 5) - SMA(Median Price, 34)
 * Median Price = (High + Low) / 2
 */

import type { OHLCV, AwesomeOscillatorParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Simple Moving Average from values
 */
function sma(values: number[], period: number, endIndex: number): number {
  let sum = 0;
  for (let i = endIndex - period + 1; i <= endIndex; i++) {
    sum += values[i];
  }
  return sum / period;
}

/**
 * Calculate Awesome Oscillator
 * @param data - OHLCV data array
 * @param params - AO parameters (fastPeriod, slowPeriod)
 * @returns Array of AO values (histogram)
 */
export function calculateAwesomeOscillator(
  data: OHLCV[],
  params: AwesomeOscillatorParams
): IndicatorValue[] {
  const { fastPeriod, slowPeriod } = params;
  const result: IndicatorValue[] = [];

  if (data.length < slowPeriod) {
    return result;
  }

  // Calculate Median Prices (HL/2)
  const medianPrices = data.map(d => (d.high + d.low) / 2);

  // Calculate AO starting from when we have enough data for slow SMA
  for (let i = slowPeriod - 1; i < data.length; i++) {
    const fastSMA = sma(medianPrices, fastPeriod, i);
    const slowSMA = sma(medianPrices, slowPeriod, i);
    const ao = fastSMA - slowSMA;

    result.push({
      time: data[i].time,
      value: ao,
    });
  }

  return result;
}

/**
 * Awesome Oscillator indicator definition with metadata
 */
export const awesomeOscillatorIndicator: IndicatorDefinition<
  AwesomeOscillatorParams,
  IndicatorValue
> = {
  meta: {
    type: 'AO',
    name: 'Awesome Oscillator',
    shortName: 'AO',
    category: 'oscillator',
    defaultParams: { fastPeriod: 5, slowPeriod: 34 },
    defaultColor: '#4CAF50',
    description: 'Histogram measuring market momentum using median price SMAs',
  },
  calculate: calculateAwesomeOscillator,
};
