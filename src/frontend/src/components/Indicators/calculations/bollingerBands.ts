/**
 * Bollinger Bands Indicator Calculation
 * 
 * Components:
 * - Middle Band: SMA(period)
 * - Upper Band: SMA + (stdDev * multiplier)
 * - Lower Band: SMA - (stdDev * multiplier)
 *
 * TASK-034: Bollinger Bands Calculation
 */

import type { IndicatorInput, BollingerParams, BollingerBandsOutput, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';

/**
 * Default Bollinger Bands parameters
 */
export const DEFAULT_BOLLINGER_PARAMS: BollingerParams = {
  period: 20,
  stdDevMultiplier: 2,
  source: 'close',
};

/**
 * Calculate standard deviation for a window of values
 * 
 * @param values - Array of numeric values
 * @param mean - Mean of the values
 * @returns Standard deviation
 */
const calculateStdDev = (values: number[], mean: number): number => {
  if (values.length === 0) return 0;
  
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(avgSquaredDiff);
};

/**
 * Calculate Bollinger Bands
 * 
 * @param data - OHLCV data array
 * @param params - Bollinger Bands parameters (period, stdDevMultiplier, source)
 * @returns Object containing upper, middle, and lower band arrays
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const bands = calculateBollingerBands(data, { period: 20, stdDevMultiplier: 2 });
 * // Returns: {
 * //   upper: [{time: ..., value: ...}, ...],
 * //   middle: [{time: ..., value: ...}, ...],
 * //   lower: [{time: ..., value: ...}, ...]
 * // }
 */
export const calculateBollingerBands = (
  data: IndicatorInput,
  params: Partial<BollingerParams> = {}
): BollingerBandsOutput => {
  const { period, stdDevMultiplier, source } = { ...DEFAULT_BOLLINGER_PARAMS, ...params };

  // Initialize empty output
  const emptyOutput: BollingerBandsOutput = {
    upper: [],
    middle: [],
    lower: [],
  };

  // Handle edge cases
  if (!data || data.length === 0) {
    return emptyOutput;
  }

  if (period <= 0) {
    console.warn('Bollinger Bands period must be positive');
    return emptyOutput;
  }

  if (data.length < period) {
    // Not enough data to calculate Bollinger Bands
    return emptyOutput;
  }

  const prices = extractPrices(data, source as PriceSource);
  const times = extractTimes(data);
  const result: BollingerBandsOutput = {
    upper: [],
    middle: [],
    lower: [],
  };

  // Calculate Bollinger Bands for each valid point
  for (let i = period - 1; i < prices.length; i++) {
    // Get the window of prices for this period
    const window = prices.slice(i - period + 1, i + 1);
    
    // Calculate SMA (middle band)
    const sum = window.reduce((acc, val) => acc + val, 0);
    const sma = sum / period;
    
    // Calculate standard deviation
    const stdDev = calculateStdDev(window, sma);
    
    // Calculate bands
    const upperBand = sma + (stdDev * stdDevMultiplier);
    const lowerBand = sma - (stdDev * stdDevMultiplier);
    
    const time = times[i];
    
    result.upper.push({ time, value: upperBand });
    result.middle.push({ time, value: sma });
    result.lower.push({ time, value: lowerBand });
  }

  return result;
};

/**
 * Calculate Bollinger Band Width
 * Measures the percentage difference between upper and lower bands
 * 
 * @param bollingerBands - Bollinger Bands output
 * @returns Array of {time, value} pairs representing band width percentage
 */
export const calculateBandWidth = (
  bollingerBands: BollingerBandsOutput
): { time: number; value: number }[] => {
  const result: { time: number; value: number }[] = [];
  
  for (let i = 0; i < bollingerBands.middle.length; i++) {
    const middle = bollingerBands.middle[i].value;
    const upper = bollingerBands.upper[i].value;
    const lower = bollingerBands.lower[i].value;
    const time = bollingerBands.middle[i].time;
    
    // Band Width = (Upper - Lower) / Middle * 100
    const bandWidth = ((upper - lower) / middle) * 100;
    
    result.push({ time, value: bandWidth });
  }
  
  return result;
};

/**
 * Calculate %B (Percent B)
 * Shows where price is relative to the bands
 * 
 * @param data - OHLCV data
 * @param bollingerBands - Bollinger Bands output
 * @returns Array of {time, value} pairs where:
 *   - 0 = price is at lower band
 *   - 0.5 = price is at middle band
 *   - 1 = price is at upper band
 *   - >1 = price is above upper band
 *   - <0 = price is below lower band
 */
export const calculatePercentB = (
  data: IndicatorInput,
  bollingerBands: BollingerBandsOutput,
  source: PriceSource = 'close'
): { time: number; value: number }[] => {
  const prices = extractPrices(data, source);
  const result: { time: number; value: number }[] = [];
  
  // Find the starting index in prices that corresponds to first band value
  const startIndex = data.length - bollingerBands.middle.length;
  
  for (let i = 0; i < bollingerBands.middle.length; i++) {
    const price = prices[startIndex + i];
    const upper = bollingerBands.upper[i].value;
    const lower = bollingerBands.lower[i].value;
    const time = bollingerBands.middle[i].time;
    
    // %B = (Price - Lower) / (Upper - Lower)
    const percentB = (price - lower) / (upper - lower);
    
    result.push({ time, value: percentB });
  }
  
  return result;
};
