/**
 * Exponential Moving Average (EMA) Calculation
 * Formula: EMA = Close × k + EMA(prev) × (1-k), where k = 2/(N+1)
 */

import type { OHLCV, EMAParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Exponential Moving Average
 * @param data - OHLCV data array
 * @param params - EMA parameters (period)
 * @returns Array of EMA values
 */
export function calculateEMA(data: OHLCV[], params: EMAParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];
  
  if (data.length < period) {
    return result;
  }
  
  // Smoothing factor
  const k = 2 / (period + 1);
  
  // Calculate initial SMA as the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;
  
  result.push({
    time: data[period - 1].time,
    value: ema,
  });
  
  // Calculate EMA for remaining points
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push({
      time: data[i].time,
      value: ema,
    });
  }
  
  return result;
}

/**
 * Helper function to calculate EMA from an array of values
 * Used internally by other indicators (MACD, DEMA, TEMA, etc.)
 */
export function calculateEMAFromValues(values: number[], period: number): number[] {
  const result: number[] = [];
  
  if (values.length < period) {
    return result;
  }
  
  const k = 2 / (period + 1);
  
  // Calculate initial SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  let ema = sum / period;
  result.push(ema);
  
  // Calculate EMA for remaining points
  for (let i = period; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
    result.push(ema);
  }
  
  return result;
}

/**
 * EMA indicator definition with metadata
 */
export const emaIndicator: IndicatorDefinition<EMAParams, IndicatorValue> = {
  meta: {
    type: 'EMA',
    name: 'Exponential Moving Average',
    shortName: 'EMA',
    category: 'overlay',
    defaultParams: { period: 20 },
    defaultColor: '#FF6D00',
    description: 'Weighted moving average that gives more weight to recent prices',
  },
  calculate: calculateEMA,
};
