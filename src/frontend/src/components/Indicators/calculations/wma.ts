/**
 * Weighted Moving Average (WMA) Indicator Calculation
 * 
 * Formula: WMA = sum(close * weight) / sum(weights)
 * Weights increase linearly: 1, 2, 3, ..., period
 *
 * TASK-033: WMA Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, MAParams, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';

/**
 * Default WMA parameters
 */
export const DEFAULT_WMA_PARAMS: MAParams = {
  period: 20,
  source: 'close',
};

/**
 * Calculate the sum of weights for a given period
 * Sum of 1 + 2 + 3 + ... + n = n(n+1)/2
 * 
 * @param period - WMA period
 * @returns Sum of weights
 */
export const getWeightSum = (period: number): number => {
  return (period * (period + 1)) / 2;
};

/**
 * Calculate Weighted Moving Average
 * 
 * @param data - OHLCV data array
 * @param params - WMA parameters (period, source)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const wma = calculateWMA(data, { period: 20 });
 * // Returns: [{time: 1610000020, value: 10.5}, ...]
 */
export const calculateWMA = (
  data: IndicatorInput,
  params: Partial<MAParams> = {}
): IndicatorOutput => {
  const { period, source } = { ...DEFAULT_WMA_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('WMA period must be positive');
    return [];
  }

  if (data.length < period) {
    // Not enough data to calculate WMA
    return [];
  }

  const prices = extractPrices(data, source as PriceSource);
  const times = extractTimes(data);
  const result: IndicatorOutput = [];
  const weightSum = getWeightSum(period);

  // Calculate WMA for each valid point
  for (let i = period - 1; i < prices.length; i++) {
    let weightedSum = 0;
    
    // Apply weights: oldest data gets weight 1, newest gets weight = period
    for (let j = 0; j < period; j++) {
      const weight = j + 1; // Weight increases from 1 to period
      const priceIndex = i - (period - 1) + j; // Start from oldest in window
      weightedSum += prices[priceIndex] * weight;
    }
    
    const wmaValue = weightedSum / weightSum;
    
    result.push({
      time: times[i],
      value: wmaValue,
    });
  }

  return result;
};

/**
 * Calculate WMA from an array of numbers (utility function)
 * Used internally by other indicators
 * 
 * @param values - Array of numeric values
 * @param period - WMA period
 * @returns Array of WMA values (same length as input, with NaN for insufficient data)
 */
export const calculateWMAFromValues = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  const result: number[] = [];
  const weightSum = getWeightSum(period);

  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      // Not enough data yet
      result.push(NaN);
    } else {
      let weightedSum = 0;
      
      for (let j = 0; j < period; j++) {
        const weight = j + 1;
        const valueIndex = i - (period - 1) + j;
        weightedSum += values[valueIndex] * weight;
      }
      
      result.push(weightedSum / weightSum);
    }
  }

  return result;
};
