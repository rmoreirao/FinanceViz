/**
 * Average True Range (ATR) Indicator Calculation
 * 
 * Formula:
 *   True Range = max(High - Low, |High - Previous Close|, |Low - Previous Close|)
 *   ATR = Smoothed average of True Range (typically using Wilder's smoothing)
 * 
 * ATR measures market volatility by decomposing the entire range of an asset
 * price for that period.
 * 
 * Parameters:
 *   - Period: 14 (default)
 *
 * TASK-047: ATR Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, ATRCalculationParams } from './types';

/**
 * Default ATR parameters
 */
export const DEFAULT_ATR_PARAMS: ATRCalculationParams = {
  period: 14,
};

/**
 * Calculate True Range for a single bar
 * 
 * @param high - Current high
 * @param low - Current low
 * @param prevClose - Previous close
 * @returns True Range value
 */
export const calculateTrueRange = (high: number, low: number, prevClose: number): number => {
  const hl = high - low;
  const hpc = Math.abs(high - prevClose);
  const lpc = Math.abs(low - prevClose);
  return Math.max(hl, hpc, lpc);
};

/**
 * Calculate Average True Range
 * 
 * @param data - OHLCV data array
 * @param params - ATR parameters (period)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const atr = calculateATR(data, { period: 14 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateATR = (
  data: IndicatorInput,
  params: Partial<ATRCalculationParams> = {}
): IndicatorOutput => {
  const { period } = { ...DEFAULT_ATR_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('ATR period must be positive');
    return [];
  }

  if (data.length < period + 1) {
    return [];
  }

  // Calculate True Range for each bar
  const trueRanges: number[] = [];
  
  // First TR is just High - Low
  trueRanges.push(data[0].high - data[0].low);
  
  // Subsequent TRs use previous close
  for (let i = 1; i < data.length; i++) {
    const tr = calculateTrueRange(data[i].high, data[i].low, data[i - 1].close);
    trueRanges.push(tr);
  }

  const result: IndicatorOutput = [];

  // Calculate initial ATR as simple average of first 'period' TRs
  let atrSum = 0;
  for (let i = 0; i < period; i++) {
    atrSum += trueRanges[i];
  }
  let atr = atrSum / period;

  result.push({
    time: data[period - 1].time,
    value: atr,
  });

  // Calculate subsequent ATRs using Wilder's smoothing
  // ATR = ((Previous ATR * (period - 1)) + Current TR) / period
  for (let i = period; i < data.length; i++) {
    atr = ((atr * (period - 1)) + trueRanges[i]) / period;
    
    result.push({
      time: data[i].time,
      value: atr,
    });
  }

  return result;
};

/**
 * Calculate ATR from values (utility function)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of close prices
 * @param period - ATR period
 * @returns Array of ATR values
 */
export const calculateATRFromValues = (
  highs: number[],
  lows: number[],
  closes: number[],
  period: number
): number[] => {
  if (!highs || !lows || !closes || highs.length === 0) {
    return [];
  }

  if (highs.length !== lows.length || highs.length !== closes.length) {
    console.warn('ATR: highs, lows, and closes must have same length');
    return [];
  }

  // Calculate True Range for each bar
  const trueRanges: number[] = [];
  
  // First TR is just High - Low
  trueRanges.push(highs[0] - lows[0]);
  
  // Subsequent TRs use previous close
  for (let i = 1; i < highs.length; i++) {
    const tr = calculateTrueRange(highs[i], lows[i], closes[i - 1]);
    trueRanges.push(tr);
  }

  const result: number[] = [];

  // Fill NaN for insufficient data
  for (let i = 0; i < period - 1; i++) {
    result.push(NaN);
  }

  // Calculate initial ATR
  let atrSum = 0;
  for (let i = 0; i < period; i++) {
    atrSum += trueRanges[i];
  }
  let atr = atrSum / period;
  result.push(atr);

  // Calculate subsequent ATRs using Wilder's smoothing
  for (let i = period; i < highs.length; i++) {
    atr = ((atr * (period - 1)) + trueRanges[i]) / period;
    result.push(atr);
  }

  return result;
};

/**
 * Calculate True Range array from OHLCV data
 * 
 * @param data - OHLCV data array
 * @returns Array of True Range values
 */
export const calculateTrueRangeArray = (data: IndicatorInput): number[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const trueRanges: number[] = [];
  
  trueRanges.push(data[0].high - data[0].low);
  
  for (let i = 1; i < data.length; i++) {
    const tr = calculateTrueRange(data[i].high, data[i].low, data[i - 1].close);
    trueRanges.push(tr);
  }

  return trueRanges;
};
