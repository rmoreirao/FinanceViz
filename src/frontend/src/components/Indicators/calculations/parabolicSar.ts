/**
 * Parabolic SAR (Stop and Reverse) Indicator Calculation
 * 
 * The Parabolic SAR is a trend-following indicator that provides 
 * potential entry and exit points. It appears as dots above or 
 * below the price bars.
 *
 * Parameters:
 *   - Step (Acceleration Factor): 0.02 (default)
 *   - Max (Maximum Acceleration Factor): 0.2 (default)
 *
 * TASK-039: Parabolic SAR Calculation
 */

import type { IndicatorInput, IndicatorOutput, ParabolicSARCalculationParams } from './types';

/**
 * Default Parabolic SAR parameters
 */
export const DEFAULT_PARABOLIC_SAR_PARAMS: ParabolicSARCalculationParams = {
  step: 0.02,
  max: 0.2,
};

/**
 * Parabolic SAR output with trend direction
 */
export interface ParabolicSAROutput {
  sar: IndicatorOutput;
  trend: ('up' | 'down')[];
}

/**
 * Calculate Parabolic SAR
 * 
 * @param data - OHLCV data array
 * @param params - Parabolic SAR parameters (step, max)
 * @returns Array of {time, value} pairs for SAR values
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const psar = calculateParabolicSAR(data, { step: 0.02, max: 0.2 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateParabolicSAR = (
  data: IndicatorInput,
  params: Partial<ParabolicSARCalculationParams> = {}
): IndicatorOutput => {
  const { step, max } = { ...DEFAULT_PARABOLIC_SAR_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length < 2) {
    return [];
  }

  if (step <= 0 || max <= 0) {
    console.warn('Parabolic SAR step and max must be positive');
    return [];
  }

  if (step > max) {
    console.warn('Parabolic SAR step should not exceed max');
  }

  const result: IndicatorOutput = [];
  
  // Initialize trend direction based on first two bars
  // If second bar closes higher, start with uptrend
  let isUptrend = data[1].close > data[0].close;
  
  // Initialize SAR
  let sar = isUptrend ? data[0].low : data[0].high;
  
  // Extreme point (EP): highest high in uptrend, lowest low in downtrend
  let ep = isUptrend ? data[0].high : data[0].low;
  
  // Acceleration factor
  let af = step;
  
  // First bar SAR (use initial value)
  result.push({
    time: data[0].time,
    value: sar,
  });
  
  for (let i = 1; i < data.length; i++) {
    const candle = data[i];
    const prevCandle = data[i - 1];
    
    // Calculate new SAR
    let newSar = sar + af * (ep - sar);
    
    // In uptrend, SAR cannot be above prior two lows
    if (isUptrend) {
      newSar = Math.min(newSar, prevCandle.low);
      if (i > 1) {
        newSar = Math.min(newSar, data[i - 2].low);
      }
      
      // Check for reversal: SAR crossed by price
      if (candle.low < newSar) {
        // Reverse to downtrend
        isUptrend = false;
        newSar = ep; // SAR becomes the extreme point
        ep = candle.low; // New EP is current low
        af = step; // Reset acceleration factor
      } else {
        // Continue uptrend
        if (candle.high > ep) {
          ep = candle.high;
          af = Math.min(af + step, max);
        }
      }
    } else {
      // In downtrend, SAR cannot be below prior two highs
      newSar = Math.max(newSar, prevCandle.high);
      if (i > 1) {
        newSar = Math.max(newSar, data[i - 2].high);
      }
      
      // Check for reversal: SAR crossed by price
      if (candle.high > newSar) {
        // Reverse to uptrend
        isUptrend = true;
        newSar = ep; // SAR becomes the extreme point
        ep = candle.high; // New EP is current high
        af = step; // Reset acceleration factor
      } else {
        // Continue downtrend
        if (candle.low < ep) {
          ep = candle.low;
          af = Math.min(af + step, max);
        }
      }
    }
    
    sar = newSar;
    
    result.push({
      time: candle.time,
      value: sar,
    });
  }

  return result;
};

/**
 * Calculate Parabolic SAR with trend direction information
 * 
 * @param data - OHLCV data array
 * @param params - Parabolic SAR parameters (step, max)
 * @returns Object containing SAR values and trend direction for each bar
 */
export const calculateParabolicSARWithTrend = (
  data: IndicatorInput,
  params: Partial<ParabolicSARCalculationParams> = {}
): ParabolicSAROutput => {
  const { step, max } = { ...DEFAULT_PARABOLIC_SAR_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length < 2) {
    return { sar: [], trend: [] };
  }

  if (step <= 0 || max <= 0) {
    console.warn('Parabolic SAR step and max must be positive');
    return { sar: [], trend: [] };
  }

  const sarResult: IndicatorOutput = [];
  const trendResult: ('up' | 'down')[] = [];
  
  // Initialize trend direction
  let isUptrend = data[1].close > data[0].close;
  let sar = isUptrend ? data[0].low : data[0].high;
  let ep = isUptrend ? data[0].high : data[0].low;
  let af = step;
  
  // First bar
  sarResult.push({ time: data[0].time, value: sar });
  trendResult.push(isUptrend ? 'up' : 'down');
  
  for (let i = 1; i < data.length; i++) {
    const candle = data[i];
    const prevCandle = data[i - 1];
    
    let newSar = sar + af * (ep - sar);
    
    if (isUptrend) {
      newSar = Math.min(newSar, prevCandle.low);
      if (i > 1) {
        newSar = Math.min(newSar, data[i - 2].low);
      }
      
      if (candle.low < newSar) {
        isUptrend = false;
        newSar = ep;
        ep = candle.low;
        af = step;
      } else {
        if (candle.high > ep) {
          ep = candle.high;
          af = Math.min(af + step, max);
        }
      }
    } else {
      newSar = Math.max(newSar, prevCandle.high);
      if (i > 1) {
        newSar = Math.max(newSar, data[i - 2].high);
      }
      
      if (candle.high > newSar) {
        isUptrend = true;
        newSar = ep;
        ep = candle.high;
        af = step;
      } else {
        if (candle.low < ep) {
          ep = candle.low;
          af = Math.min(af + step, max);
        }
      }
    }
    
    sar = newSar;
    
    sarResult.push({ time: candle.time, value: sar });
    trendResult.push(isUptrend ? 'up' : 'down');
  }

  return { sar: sarResult, trend: trendResult };
};
