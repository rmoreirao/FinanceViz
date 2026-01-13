/**
 * Williams %R Indicator Calculation
 * 
 * Formula: %R = (Highest High - Close) / (Highest High - Lowest Low) * -100
 * 
 * Williams %R is a momentum indicator that measures overbought and 
 * oversold levels. It is similar to the Stochastic Oscillator but 
 * expressed as a negative value.
 * 
 * Parameters:
 *   - Period: 14 (default)
 * 
 * Range: -100 to 0
 *   - Overbought: > -20 (closer to 0)
 *   - Oversold: < -80 (closer to -100)
 *
 * TASK-045: Williams %R Calculation
 */

import type { IndicatorInput, IndicatorOutput, WilliamsRCalculationParams } from './types';

/**
 * Default Williams %R parameters
 */
export const DEFAULT_WILLIAMS_R_PARAMS: WilliamsRCalculationParams = {
  period: 14,
};

/**
 * Williams %R reference levels
 */
export const WILLIAMS_R_LEVELS = {
  OVERBOUGHT: -20,
  OVERSOLD: -80,
};

/**
 * Get the highest high over a period
 */
const getHighestHigh = (data: IndicatorInput, endIndex: number, period: number): number => {
  let highest = -Infinity;
  const startIndex = Math.max(0, endIndex - period + 1);
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (data[i].high > highest) {
      highest = data[i].high;
    }
  }
  
  return highest;
};

/**
 * Get the lowest low over a period
 */
const getLowestLow = (data: IndicatorInput, endIndex: number, period: number): number => {
  let lowest = Infinity;
  const startIndex = Math.max(0, endIndex - period + 1);
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (data[i].low < lowest) {
      lowest = data[i].low;
    }
  }
  
  return lowest;
};

/**
 * Calculate Williams %R
 * 
 * @param data - OHLCV data array
 * @param params - Williams %R parameters (period)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const williamsR = calculateWilliamsR(data, { period: 14 });
 * // Returns: [{time: ..., value: ...}, ...] with values from -100 to 0
 */
export const calculateWilliamsR = (
  data: IndicatorInput,
  params: Partial<WilliamsRCalculationParams> = {}
): IndicatorOutput => {
  const { period } = { ...DEFAULT_WILLIAMS_R_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('Williams %R period must be positive');
    return [];
  }

  if (data.length < period) {
    return [];
  }

  const result: IndicatorOutput = [];

  for (let i = period - 1; i < data.length; i++) {
    const highestHigh = getHighestHigh(data, i, period);
    const lowestLow = getLowestLow(data, i, period);
    const range = highestHigh - lowestLow;
    
    let williamsR: number;
    if (range === 0) {
      // If high == low, %R is -50 (midpoint)
      williamsR = -50;
    } else {
      // %R = (Highest High - Close) / (Highest High - Lowest Low) * -100
      williamsR = ((highestHigh - data[i].close) / range) * -100;
    }
    
    result.push({
      time: data[i].time,
      value: williamsR,
    });
  }

  return result;
};

/**
 * Calculate Williams %R from values (utility function)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of close prices
 * @param period - Lookback period
 * @returns Array of Williams %R values
 */
export const calculateWilliamsRFromValues = (
  highs: number[],
  lows: number[],
  closes: number[],
  period: number
): number[] => {
  if (!highs || !lows || !closes || highs.length === 0) {
    return [];
  }

  if (highs.length !== lows.length || highs.length !== closes.length) {
    console.warn('Williams %R: highs, lows, and closes must have same length');
    return [];
  }

  const result: number[] = [];

  for (let i = 0; i < highs.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;
      
      for (let j = i - period + 1; j <= i; j++) {
        if (highs[j] > highestHigh) highestHigh = highs[j];
        if (lows[j] < lowestLow) lowestLow = lows[j];
      }
      
      const range = highestHigh - lowestLow;
      if (range === 0) {
        result.push(-50);
      } else {
        result.push(((highestHigh - closes[i]) / range) * -100);
      }
    }
  }

  return result;
};

/**
 * Get Williams %R signal
 * 
 * @param value - Williams %R value
 * @returns 'overbought', 'oversold', or 'neutral'
 */
export const getWilliamsRSignal = (value: number): 'overbought' | 'oversold' | 'neutral' => {
  if (value >= WILLIAMS_R_LEVELS.OVERBOUGHT) {
    return 'overbought';
  } else if (value <= WILLIAMS_R_LEVELS.OVERSOLD) {
    return 'oversold';
  }
  return 'neutral';
};
