/**
 * Momentum Indicator Calculation
 * 
 * Formula: Momentum = Close - Close[n]
 * 
 * The Momentum indicator measures the amount that a security's price 
 * has changed over a given time span.
 * 
 * Parameters:
 *   - Period: 10 (default)
 * 
 * The zero line serves as a reference:
 *   - Above zero: Bullish momentum
 *   - Below zero: Bearish momentum
 *
 * TASK-050: Momentum Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, MomentumCalculationParams, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';

/**
 * Default Momentum parameters
 */
export const DEFAULT_MOMENTUM_PARAMS: MomentumCalculationParams = {
  period: 10,
};

/**
 * Calculate Momentum
 * 
 * @param data - OHLCV data array
 * @param params - Momentum parameters (period)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const momentum = calculateMomentum(data, { period: 10 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateMomentum = (
  data: IndicatorInput,
  params: Partial<MomentumCalculationParams> = {}
): IndicatorOutput => {
  const { period } = { ...DEFAULT_MOMENTUM_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('Momentum period must be positive');
    return [];
  }

  if (data.length <= period) {
    return [];
  }

  const prices = extractPrices(data, 'close' as PriceSource);
  const times = extractTimes(data);
  const result: IndicatorOutput = [];

  for (let i = period; i < prices.length; i++) {
    const momentum = prices[i] - prices[i - period];
    
    result.push({
      time: times[i],
      value: momentum,
    });
  }

  return result;
};

/**
 * Calculate Momentum from an array of numbers (utility function)
 * 
 * @param values - Array of numeric values
 * @param period - Momentum period
 * @returns Array of Momentum values (same length as input, with NaN for insufficient data)
 */
export const calculateMomentumFromValues = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i < period) {
      result.push(NaN);
    } else {
      result.push(values[i] - values[i - period]);
    }
  }

  return result;
};

/**
 * Get Momentum signal
 * 
 * @param value - Momentum value
 * @param prevValue - Previous Momentum value (optional, for direction)
 * @returns 'bullish', 'bearish', or 'neutral'
 */
export const getMomentumSignal = (
  value: number,
  prevValue?: number
): 'bullish' | 'bearish' | 'neutral' => {
  if (prevValue !== undefined) {
    // Check both position and direction
    if (value > 0 && value > prevValue) {
      return 'bullish';
    } else if (value < 0 && value < prevValue) {
      return 'bearish';
    }
  } else {
    // Just check position relative to zero
    if (value > 0) {
      return 'bullish';
    } else if (value < 0) {
      return 'bearish';
    }
  }
  return 'neutral';
};
