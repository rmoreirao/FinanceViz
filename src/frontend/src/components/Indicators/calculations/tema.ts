/**
 * Triple Exponential Moving Average (TEMA) Indicator Calculation
 * 
 * Formula: TEMA = 3*EMA - 3*EMA(EMA) + EMA(EMA(EMA))
 * 
 * TEMA is designed to reduce lag even more than DEMA by applying
 * three layers of exponential smoothing.
 *
 * TASK-036: TEMA Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, MAParams, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';
import { calculateEMAFromValues } from './ema';

/**
 * Default TEMA parameters
 */
export const DEFAULT_TEMA_PARAMS: MAParams = {
  period: 20,
  source: 'close',
};

/**
 * Calculate Triple Exponential Moving Average
 * 
 * @param data - OHLCV data array
 * @param params - TEMA parameters (period, source)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const tema = calculateTEMA(data, { period: 20 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateTEMA = (
  data: IndicatorInput,
  params: Partial<MAParams> = {}
): IndicatorOutput => {
  const { period, source } = { ...DEFAULT_TEMA_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('TEMA period must be positive');
    return [];
  }

  // TEMA needs at least 3*period - 2 data points to have a valid value
  // First EMA needs 'period' points, second needs 'period-1', third needs 'period-1'
  if (data.length < 3 * period - 2) {
    // Not enough data to calculate TEMA
    return [];
  }

  const prices = extractPrices(data, source as PriceSource);
  const times = extractTimes(data);

  // Calculate first EMA
  const ema1 = calculateEMAFromValues(prices, period);
  
  // Calculate EMA of EMA
  const ema2 = calculateEMAFromValues(ema1, period);
  
  // Calculate EMA of EMA of EMA (triple EMA)
  const ema3 = calculateEMAFromValues(ema2, period);
  
  // Calculate TEMA: 3*EMA - 3*EMA(EMA) + EMA(EMA(EMA))
  const result: IndicatorOutput = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (!isNaN(ema1[i]) && !isNaN(ema2[i]) && !isNaN(ema3[i])) {
      const temaValue = 3 * ema1[i] - 3 * ema2[i] + ema3[i];
      result.push({
        time: times[i],
        value: temaValue,
      });
    }
  }

  return result;
};

/**
 * Calculate TEMA from an array of numbers (utility function)
 * Used internally by other indicators
 * 
 * @param values - Array of numeric values
 * @param period - TEMA period
 * @returns Array of TEMA values (same length as input, with NaN for insufficient data)
 */
export const calculateTEMAFromValues = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  // Calculate first EMA
  const ema1 = calculateEMAFromValues(values, period);
  
  // Calculate EMA of EMA
  const ema2 = calculateEMAFromValues(ema1, period);
  
  // Calculate EMA of EMA of EMA
  const ema3 = calculateEMAFromValues(ema2, period);
  
  // Calculate TEMA: 3*EMA - 3*EMA(EMA) + EMA(EMA(EMA))
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (isNaN(ema1[i]) || isNaN(ema2[i]) || isNaN(ema3[i])) {
      result.push(NaN);
    } else {
      result.push(3 * ema1[i] - 3 * ema2[i] + ema3[i]);
    }
  }

  return result;
};
