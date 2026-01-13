/**
 * MACD (Moving Average Convergence Divergence) Calculation
 * MACD shows the relationship between two EMAs of a security's price
 * Output: MACD line, Signal line, and Histogram
 */

import type { OHLCV, MACDParams } from '../../../types';
import type { MACDValue, IndicatorDefinition } from './types';
import { calculateEMAFromValues } from './ema';

/**
 * Calculate MACD
 * @param data - OHLCV data array
 * @param params - MACD parameters (fastPeriod, slowPeriod, signalPeriod)
 * @returns Array of MACD values with macd line, signal line, and histogram
 */
export function calculateMACD(data: OHLCV[], params: MACDParams): MACDValue[] {
  const { fastPeriod, slowPeriod, signalPeriod } = params;
  const result: MACDValue[] = [];

  if (data.length < slowPeriod + signalPeriod) {
    return result;
  }

  // Get close prices
  const closes = data.map(d => d.close);

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMAFromValues(closes, fastPeriod);
  const slowEMA = calculateEMAFromValues(closes, slowPeriod);

  // Calculate MACD line (fast EMA - slow EMA)
  // The slow EMA starts later, so we need to align the arrays
  const slowStartIndex = slowPeriod - fastPeriod;
  const macdValues: number[] = [];

  for (let i = 0; i < slowEMA.length; i++) {
    const fastIndex = i + slowStartIndex;
    if (fastIndex >= 0 && fastIndex < fastEMA.length) {
      macdValues.push(fastEMA[fastIndex] - slowEMA[i]);
    }
  }

  // Calculate signal line (EMA of MACD)
  const signalLine = calculateEMAFromValues(macdValues, signalPeriod);

  // Build result with histogram
  const dataStartIndex = slowPeriod - 1 + signalPeriod - 1;

  for (let i = 0; i < signalLine.length; i++) {
    const macdIndex = i + signalPeriod - 1;
    const dataIndex = dataStartIndex + i;

    if (dataIndex < data.length && macdIndex < macdValues.length) {
      const macd = macdValues[macdIndex];
      const signal = signalLine[i];
      const histogram = macd - signal;

      result.push({
        time: data[dataIndex].time,
        macd,
        signal,
        histogram,
      });
    }
  }

  return result;
}

/**
 * MACD indicator definition with metadata
 */
export const macdIndicator: IndicatorDefinition<MACDParams, MACDValue> = {
  meta: {
    type: 'MACD',
    name: 'Moving Average Convergence Divergence',
    shortName: 'MACD',
    category: 'oscillator',
    defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    defaultColor: '#2196F3',
    description: 'Trend-following momentum indicator showing relationship between two EMAs',
    outputs: ['macd', 'signal', 'histogram'],
  },
  calculate: calculateMACD,
};
