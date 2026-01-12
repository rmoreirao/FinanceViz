/**
 * Simple Moving Average (SMA) Calculation
 * Formula: Sum of N closes / N
 */

import type { OHLCV, SMAParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Simple Moving Average
 * @param data - OHLCV data array
 * @param params - SMA parameters (period)
 * @returns Array of SMA values
 */
export function calculateSMA(data: OHLCV[], params: SMAParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];
  
  if (data.length < period) {
    return result;
  }
  
  // Calculate SMA for each valid point
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  
  return result;
}

/**
 * Helper function to calculate SMA from an array of values
 * Used internally by other indicators
 */
export function calculateSMAFromValues(values: number[], period: number): number[] {
  const result: number[] = [];
  
  if (values.length < period) {
    return result;
  }
  
  for (let i = period - 1; i < values.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += values[i - j];
    }
    result.push(sum / period);
  }
  
  return result;
}

/**
 * SMA indicator definition with metadata
 */
export const smaIndicator: IndicatorDefinition<SMAParams, IndicatorValue> = {
  meta: {
    type: 'SMA',
    name: 'Simple Moving Average',
    shortName: 'SMA',
    category: 'overlay',
    defaultParams: { period: 20 },
    defaultColor: '#2962FF',
    description: 'Average price over a specified number of periods',
  },
  calculate: calculateSMA,
};
