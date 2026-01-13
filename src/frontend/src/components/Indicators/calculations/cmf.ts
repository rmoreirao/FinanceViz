/**
 * Chaikin Money Flow (CMF) Indicator Calculation
 * 
 * Formula:
 *   Money Flow Multiplier = ((Close - Low) - (High - Close)) / (High - Low)
 *   Money Flow Volume = MFM * Volume
 *   CMF = sum(MFV, period) / sum(Volume, period)
 * 
 * CMF measures the amount of Money Flow Volume over a specific period.
 * It oscillates between -1 and +1.
 * 
 * Parameters:
 *   - Period: 20 (default)
 * 
 * Range: -1 to 1
 *   - Positive: Buying pressure
 *   - Negative: Selling pressure
 *
 * TASK-052: CMF Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, CMFCalculationParams } from './types';

/**
 * Default CMF parameters
 */
export const DEFAULT_CMF_PARAMS: CMFCalculationParams = {
  period: 20,
};

/**
 * Calculate Money Flow Multiplier
 * MFM = ((Close - Low) - (High - Close)) / (High - Low)
 * Simplified: MFM = (2 * Close - Low - High) / (High - Low)
 */
const getMoneyFlowMultiplier = (high: number, low: number, close: number): number => {
  const range = high - low;
  if (range === 0) {
    return 0;
  }
  return ((close - low) - (high - close)) / range;
};

/**
 * Calculate Chaikin Money Flow
 * 
 * @param data - OHLCV data array
 * @param params - CMF parameters (period)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const cmf = calculateCMF(data, { period: 20 });
 * // Returns: [{time: ..., value: ...}, ...] with values between -1 and 1
 */
export const calculateCMF = (
  data: IndicatorInput,
  params: Partial<CMFCalculationParams> = {}
): IndicatorOutput => {
  const { period } = { ...DEFAULT_CMF_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('CMF period must be positive');
    return [];
  }

  if (data.length < period) {
    return [];
  }

  // Calculate Money Flow Volume for each bar
  const moneyFlowVolume: number[] = data.map(candle => {
    const mfm = getMoneyFlowMultiplier(candle.high, candle.low, candle.close);
    return mfm * candle.volume;
  });

  const result: IndicatorOutput = [];

  for (let i = period - 1; i < data.length; i++) {
    let sumMFV = 0;
    let sumVolume = 0;

    for (let j = i - period + 1; j <= i; j++) {
      sumMFV += moneyFlowVolume[j];
      sumVolume += data[j].volume;
    }

    const cmf = sumVolume === 0 ? 0 : sumMFV / sumVolume;

    result.push({
      time: data[i].time,
      value: cmf,
    });
  }

  return result;
};

/**
 * Calculate CMF from arrays (utility function)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of close prices
 * @param volumes - Array of volumes
 * @param period - CMF period
 * @returns Array of CMF values
 */
export const calculateCMFFromValues = (
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[],
  period: number
): number[] => {
  if (!highs || !lows || !closes || !volumes || highs.length === 0) {
    return [];
  }

  if (highs.length !== lows.length || highs.length !== closes.length || highs.length !== volumes.length) {
    console.warn('CMF: All arrays must have same length');
    return [];
  }

  // Calculate Money Flow Volume for each bar
  const moneyFlowVolume = highs.map((h, i) => {
    const mfm = getMoneyFlowMultiplier(h, lows[i], closes[i]);
    return mfm * volumes[i];
  });

  const result: number[] = [];

  for (let i = 0; i < highs.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      let sumMFV = 0;
      let sumVolume = 0;

      for (let j = i - period + 1; j <= i; j++) {
        sumMFV += moneyFlowVolume[j];
        sumVolume += volumes[j];
      }

      result.push(sumVolume === 0 ? 0 : sumMFV / sumVolume);
    }
  }

  return result;
};

/**
 * Get CMF signal
 * 
 * @param value - CMF value
 * @returns 'bullish', 'bearish', or 'neutral'
 */
export const getCMFSignal = (value: number): 'bullish' | 'bearish' | 'neutral' => {
  if (value > 0.05) {
    return 'bullish';
  } else if (value < -0.05) {
    return 'bearish';
  }
  return 'neutral';
};
