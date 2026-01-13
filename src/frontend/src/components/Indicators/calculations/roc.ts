/**
 * Rate of Change (ROC) Indicator Calculation
 * 
 * Formula: ROC = ((Close - Close[n]) / Close[n]) * 100
 * 
 * ROC measures the percentage change in price between the current price
 * and the price n periods ago.
 * 
 * Parameters:
 *   - Period: 12 (default)
 *
 * TASK-049: ROC Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, ROCCalculationParams, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';

/**
 * Default ROC parameters
 */
export const DEFAULT_ROC_PARAMS: ROCCalculationParams = {
  period: 12,
};

/**
 * Calculate Rate of Change
 * 
 * @param data - OHLCV data array
 * @param params - ROC parameters (period)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const roc = calculateROC(data, { period: 12 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateROC = (
  data: IndicatorInput,
  params: Partial<ROCCalculationParams> = {}
): IndicatorOutput => {
  const { period } = { ...DEFAULT_ROC_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('ROC period must be positive');
    return [];
  }

  if (data.length <= period) {
    return [];
  }

  const prices = extractPrices(data, 'close' as PriceSource);
  const times = extractTimes(data);
  const result: IndicatorOutput = [];

  for (let i = period; i < prices.length; i++) {
    const prevPrice = prices[i - period];
    
    let roc: number;
    if (prevPrice === 0) {
      roc = 0;
    } else {
      roc = ((prices[i] - prevPrice) / prevPrice) * 100;
    }
    
    result.push({
      time: times[i],
      value: roc,
    });
  }

  return result;
};

/**
 * Calculate ROC from an array of numbers (utility function)
 * 
 * @param values - Array of numeric values
 * @param period - ROC period
 * @returns Array of ROC values (same length as input, with NaN for insufficient data)
 */
export const calculateROCFromValues = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i < period) {
      result.push(NaN);
    } else {
      const prevValue = values[i - period];
      if (prevValue === 0) {
        result.push(0);
      } else {
        result.push(((values[i] - prevValue) / prevValue) * 100);
      }
    }
  }

  return result;
};

/**
 * Get ROC signal
 * 
 * @param value - ROC value
 * @returns 'bullish', 'bearish', or 'neutral'
 */
export const getROCSignal = (value: number): 'bullish' | 'bearish' | 'neutral' => {
  if (value > 0) {
    return 'bullish';
  } else if (value < 0) {
    return 'bearish';
  }
  return 'neutral';
};
