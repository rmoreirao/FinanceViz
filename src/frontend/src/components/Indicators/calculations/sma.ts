/**
 * Simple Moving Average (SMA) Indicator Calculation
 * 
 * Formula: SMA = sum(close, period) / period
 *
 * TASK-031: SMA Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, MAParams, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';

/**
 * Default SMA parameters
 */
export const DEFAULT_SMA_PARAMS: MAParams = {
  period: 20,
  source: 'close',
};

/**
 * Calculate Simple Moving Average
 * 
 * @param data - OHLCV data array
 * @param params - SMA parameters (period, source)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const sma = calculateSMA(data, { period: 20 });
 * // Returns: [{time: 1610000020, value: 10.5}, ...]
 */
export const calculateSMA = (
  data: IndicatorInput,
  params: Partial<MAParams> = {}
): IndicatorOutput => {
  const { period, source } = { ...DEFAULT_SMA_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('SMA period must be positive');
    return [];
  }

  if (data.length < period) {
    // Not enough data to calculate SMA
    return [];
  }

  const prices = extractPrices(data, source as PriceSource);
  const times = extractTimes(data);
  const result: IndicatorOutput = [];

  // Calculate SMA for each valid point
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - j];
    }
    const smaValue = sum / period;
    
    result.push({
      time: times[i],
      value: smaValue,
    });
  }

  return result;
};

/**
 * Calculate SMA from an array of numbers (utility function)
 * Used internally by other indicators like Bollinger Bands
 * 
 * @param values - Array of numeric values
 * @param period - SMA period
 * @returns Array of SMA values (same length as input, with NaN for insufficient data)
 */
export const calculateSMAFromValues = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      // Not enough data yet
      result.push(NaN);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += values[i - j];
      }
      result.push(sum / period);
    }
  }

  return result;
};

/**
 * Calculate running SMA (efficient for streaming data)
 * 
 * @param values - Array of numeric values
 * @param period - SMA period
 * @returns Array of SMA values
 */
export const calculateRunningSMA = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  const result: number[] = [];
  let windowSum = 0;

  for (let i = 0; i < values.length; i++) {
    windowSum += values[i];
    
    if (i >= period) {
      // Remove the oldest value from the sum
      windowSum -= values[i - period];
    }

    if (i >= period - 1) {
      result.push(windowSum / period);
    } else {
      result.push(NaN);
    }
  }

  return result;
};
