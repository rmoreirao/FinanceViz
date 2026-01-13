/**
 * Double Exponential Moving Average (DEMA) Indicator Calculation
 * 
 * Formula: DEMA = 2 * EMA - EMA(EMA)
 * 
 * DEMA is designed to reduce the lag inherent in traditional moving averages
 * by applying EMA calculations twice and using a specific formula.
 *
 * TASK-035: DEMA Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, MAParams, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';
import { calculateEMAFromValues } from './ema';

/**
 * Default DEMA parameters
 */
export const DEFAULT_DEMA_PARAMS: MAParams = {
  period: 20,
  source: 'close',
};

/**
 * Calculate Double Exponential Moving Average
 * 
 * @param data - OHLCV data array
 * @param params - DEMA parameters (period, source)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const dema = calculateDEMA(data, { period: 20 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateDEMA = (
  data: IndicatorInput,
  params: Partial<MAParams> = {}
): IndicatorOutput => {
  const { period, source } = { ...DEFAULT_DEMA_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('DEMA period must be positive');
    return [];
  }

  // DEMA needs at least 2*period - 1 data points to have a valid value
  // First EMA needs 'period' points, second EMA(EMA) needs another 'period-1' points
  if (data.length < 2 * period - 1) {
    // Not enough data to calculate DEMA
    return [];
  }

  const prices = extractPrices(data, source as PriceSource);
  const times = extractTimes(data);

  // Calculate first EMA
  const ema1 = calculateEMAFromValues(prices, period);
  
  // Calculate EMA of EMA (using only valid EMA values)
  const ema2 = calculateEMAFromValues(ema1, period);
  
  // Calculate DEMA: 2 * EMA - EMA(EMA)
  const result: IndicatorOutput = [];
  
  for (let i = 0; i < ema2.length; i++) {
    if (!isNaN(ema1[i]) && !isNaN(ema2[i])) {
      const demaValue = 2 * ema1[i] - ema2[i];
      result.push({
        time: times[i],
        value: demaValue,
      });
    }
  }

  return result;
};

/**
 * Calculate DEMA from an array of numbers (utility function)
 * Used internally by other indicators
 * 
 * @param values - Array of numeric values
 * @param period - DEMA period
 * @returns Array of DEMA values (same length as input, with NaN for insufficient data)
 */
export const calculateDEMAFromValues = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  // Calculate first EMA
  const ema1 = calculateEMAFromValues(values, period);
  
  // Calculate EMA of EMA
  const ema2 = calculateEMAFromValues(ema1, period);
  
  // Calculate DEMA: 2 * EMA - EMA(EMA)
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (isNaN(ema1[i]) || isNaN(ema2[i])) {
      result.push(NaN);
    } else {
      result.push(2 * ema1[i] - ema2[i]);
    }
  }

  return result;
};
