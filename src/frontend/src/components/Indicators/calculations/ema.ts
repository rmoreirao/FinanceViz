/**
 * Exponential Moving Average (EMA) Indicator Calculation
 * 
 * Formula: EMA = (close * multiplier) + (prevEMA * (1 - multiplier))
 * Multiplier: 2 / (period + 1)
 *
 * TASK-032: EMA Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, MAParams, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';

/**
 * Default EMA parameters
 */
export const DEFAULT_EMA_PARAMS: MAParams = {
  period: 20,
  source: 'close',
};

/**
 * Calculate the EMA multiplier (smoothing factor)
 * 
 * @param period - EMA period
 * @returns Multiplier value
 */
export const getEMAMultiplier = (period: number): number => {
  return 2 / (period + 1);
};

/**
 * Calculate Exponential Moving Average
 * 
 * @param data - OHLCV data array
 * @param params - EMA parameters (period, source)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const ema = calculateEMA(data, { period: 20 });
 * // Returns: [{time: 1610000020, value: 10.5}, ...]
 */
export const calculateEMA = (
  data: IndicatorInput,
  params: Partial<MAParams> = {}
): IndicatorOutput => {
  const { period, source } = { ...DEFAULT_EMA_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('EMA period must be positive');
    return [];
  }

  if (data.length < period) {
    // Not enough data to calculate EMA
    return [];
  }

  const prices = extractPrices(data, source as PriceSource);
  const times = extractTimes(data);
  const result: IndicatorOutput = [];
  const multiplier = getEMAMultiplier(period);

  // Calculate initial SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let ema = sum / period;

  // First EMA value (using SMA)
  result.push({
    time: times[period - 1],
    value: ema,
  });

  // Calculate remaining EMA values
  for (let i = period; i < prices.length; i++) {
    // EMA = (Close - Previous EMA) * multiplier + Previous EMA
    // Which is equivalent to: (Close * multiplier) + (Previous EMA * (1 - multiplier))
    ema = (prices[i] - ema) * multiplier + ema;
    
    result.push({
      time: times[i],
      value: ema,
    });
  }

  return result;
};

/**
 * Calculate EMA from an array of numbers (utility function)
 * Used internally by other indicators like MACD, DEMA, TEMA
 * 
 * @param values - Array of numeric values
 * @param period - EMA period
 * @returns Array of EMA values (same length as input, with NaN for insufficient data)
 */
export const calculateEMAFromValues = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  if (values.length < period) {
    return values.map(() => NaN);
  }

  const result: number[] = [];
  const multiplier = getEMAMultiplier(period);

  // Calculate initial SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
    result.push(NaN); // Not enough data yet
  }
  
  // Replace last NaN with SMA value
  let ema = sum / period;
  result[period - 1] = ema;

  // Calculate remaining EMA values
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    result.push(ema);
  }

  return result;
};

/**
 * Calculate EMA with custom starting value
 * Useful when you want to continue an EMA calculation
 * 
 * @param values - Array of numeric values
 * @param period - EMA period
 * @param startValue - Starting EMA value
 * @returns Array of EMA values
 */
export const calculateEMAWithStart = (
  values: number[],
  period: number,
  startValue: number
): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  const result: number[] = [];
  const multiplier = getEMAMultiplier(period);
  let ema = startValue;

  for (let i = 0; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    result.push(ema);
  }

  return result;
};
