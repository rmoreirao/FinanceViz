/**
 * Stochastic Oscillator Indicator Calculation
 * 
 * Formula:
 *   %K = (Close - Low(n)) / (High(n) - Low(n)) * 100
 *   %D = SMA(%K, smoothPeriod)
 * 
 * The Stochastic Oscillator measures the position of the close 
 * relative to the high-low range over a set number of periods.
 * 
 * Parameters:
 *   - %K Period: 14 (default)
 *   - %D Period: 3 (default)
 *   - Smooth: 3 (default) - for Fast/Slow Stochastic
 * 
 * Range: 0-100
 *   - Overbought: > 80
 *   - Oversold: < 20
 *
 * TASK-043: Stochastic Oscillator Calculation
 */

import type { IndicatorInput, StochasticCalculationParams, StochasticOutput, IndicatorOutput } from './types';
import { calculateSMAFromValues } from './sma';

/**
 * Default Stochastic parameters
 */
export const DEFAULT_STOCHASTIC_PARAMS: StochasticCalculationParams = {
  kPeriod: 14,
  dPeriod: 3,
  smooth: 3,
};

/**
 * Stochastic reference levels
 */
export const STOCHASTIC_LEVELS = {
  OVERBOUGHT: 80,
  OVERSOLD: 20,
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
 * Calculate Stochastic Oscillator
 * 
 * This calculates the "Slow Stochastic" which applies smoothing to %K
 * before calculating %D.
 * 
 * @param data - OHLCV data array
 * @param params - Stochastic parameters (kPeriod, dPeriod, smooth)
 * @returns Object containing %K and %D lines
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const stoch = calculateStochastic(data, { kPeriod: 14, dPeriod: 3, smooth: 3 });
 * // Returns: { k: [...], d: [...] }
 */
export const calculateStochastic = (
  data: IndicatorInput,
  params: Partial<StochasticCalculationParams> = {}
): StochasticOutput => {
  const { kPeriod, dPeriod, smooth } = { ...DEFAULT_STOCHASTIC_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return { k: [], d: [] };
  }

  if (kPeriod <= 0 || dPeriod <= 0 || smooth <= 0) {
    console.warn('Stochastic periods must be positive');
    return { k: [], d: [] };
  }

  if (data.length < kPeriod) {
    // Not enough data to calculate Stochastic
    return { k: [], d: [] };
  }

  // Calculate raw %K values (Fast Stochastic %K)
  const rawK: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      rawK.push(NaN);
    } else {
      const highestHigh = getHighestHigh(data, i, kPeriod);
      const lowestLow = getLowestLow(data, i, kPeriod);
      const range = highestHigh - lowestLow;
      
      if (range === 0) {
        // If high == low, %K is 50 (midpoint)
        rawK.push(50);
      } else {
        const k = ((data[i].close - lowestLow) / range) * 100;
        rawK.push(k);
      }
    }
  }

  // Apply smoothing to %K (Slow Stochastic %K)
  const smoothedK = smooth > 1 
    ? calculateSMAFromValues(rawK.filter(v => !isNaN(v)), smooth)
    : rawK.filter(v => !isNaN(v));

  // Calculate %D (SMA of smoothed %K)
  const dValues = calculateSMAFromValues(smoothedK, dPeriod);

  // Build output arrays
  const kOutput: IndicatorOutput = [];
  const dOutput: IndicatorOutput = [];

  // Determine starting index for valid %K values
  const kStartIndex = kPeriod - 1 + (smooth > 1 ? smooth - 1 : 0);
  
  let smoothedIdx = 0;
  for (let i = kStartIndex; i < data.length && smoothedIdx < smoothedK.length; i++) {
    const kValue = smoothedK[smoothedIdx];
    const dValue = dValues[smoothedIdx];
    
    if (!isNaN(kValue)) {
      kOutput.push({
        time: data[i].time,
        value: kValue,
      });
      
      if (!isNaN(dValue)) {
        dOutput.push({
          time: data[i].time,
          value: dValue,
        });
      }
    }
    
    smoothedIdx++;
  }

  return { k: kOutput, d: dOutput };
};

/**
 * Calculate Fast Stochastic (no smoothing on %K)
 * 
 * @param data - OHLCV data array
 * @param params - Stochastic parameters (kPeriod, dPeriod)
 * @returns Object containing %K and %D lines
 */
export const calculateFastStochastic = (
  data: IndicatorInput,
  params: Partial<StochasticCalculationParams> = {}
): StochasticOutput => {
  return calculateStochastic(data, { ...params, smooth: 1 });
};

/**
 * Calculate Stochastic from values (utility function)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of close prices
 * @param kPeriod - %K period
 * @param dPeriod - %D period
 * @param smooth - Smoothing period for %K
 * @returns Object with k and d arrays
 */
export const calculateStochasticFromValues = (
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = DEFAULT_STOCHASTIC_PARAMS.kPeriod,
  dPeriod: number = DEFAULT_STOCHASTIC_PARAMS.dPeriod,
  smooth: number = DEFAULT_STOCHASTIC_PARAMS.smooth
): { k: number[]; d: number[] } => {
  if (!highs || !lows || !closes || highs.length === 0) {
    return { k: [], d: [] };
  }

  if (highs.length !== lows.length || highs.length !== closes.length) {
    console.warn('Stochastic: highs, lows, and closes must have same length');
    return { k: [], d: [] };
  }

  const length = highs.length;
  const rawK: number[] = [];

  // Calculate raw %K
  for (let i = 0; i < length; i++) {
    if (i < kPeriod - 1) {
      rawK.push(NaN);
    } else {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;
      
      for (let j = i - kPeriod + 1; j <= i; j++) {
        if (highs[j] > highestHigh) highestHigh = highs[j];
        if (lows[j] < lowestLow) lowestLow = lows[j];
      }
      
      const range = highestHigh - lowestLow;
      if (range === 0) {
        rawK.push(50);
      } else {
        rawK.push(((closes[i] - lowestLow) / range) * 100);
      }
    }
  }

  // Apply smoothing to %K
  const k = smooth > 1 ? calculateSMAFromValues(rawK, smooth) : rawK;

  // Calculate %D
  const d = calculateSMAFromValues(k, dPeriod);

  return { k, d };
};

/**
 * Get Stochastic signal based on values
 * 
 * @param kValue - %K value
 * @param dValue - %D value
 * @returns 'overbought', 'oversold', or 'neutral'
 */
export const getStochasticSignal = (
  kValue: number,
  dValue?: number
): 'overbought' | 'oversold' | 'neutral' => {
  const value = dValue !== undefined ? (kValue + dValue) / 2 : kValue;
  
  if (value >= STOCHASTIC_LEVELS.OVERBOUGHT) {
    return 'overbought';
  } else if (value <= STOCHASTIC_LEVELS.OVERSOLD) {
    return 'oversold';
  }
  return 'neutral';
};
