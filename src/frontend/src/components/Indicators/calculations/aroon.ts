/**
 * Aroon Indicator Calculation
 * 
 * Formula:
 *   Aroon Up = ((period - periods since highest high) / period) * 100
 *   Aroon Down = ((period - periods since lowest low) / period) * 100
 * 
 * The Aroon indicator measures the time between highs and lows over 
 * a time period. It helps identify trend changes and trend strength.
 * 
 * Parameters:
 *   - Period: 25 (default)
 * 
 * Range: 0-100
 *   - Aroon Up > 70 and Aroon Down < 30: Strong uptrend
 *   - Aroon Down > 70 and Aroon Up < 30: Strong downtrend
 *
 * TASK-054: Aroon Indicator Calculation
 */

import type { IndicatorInput, AroonCalculationParams, AroonOutput, IndicatorOutput } from './types';

/**
 * Default Aroon parameters
 */
export const DEFAULT_AROON_PARAMS: AroonCalculationParams = {
  period: 25,
};

/**
 * Aroon reference levels
 */
export const AROON_LEVELS = {
  STRONG: 70,
  WEAK: 30,
};

/**
 * Find periods since highest high
 */
const periodsSinceHighestHigh = (data: IndicatorInput, endIndex: number, period: number): number => {
  let highest = -Infinity;
  let periodsSince = 0;
  const startIndex = Math.max(0, endIndex - period);
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (data[i].high >= highest) {
      highest = data[i].high;
      periodsSince = endIndex - i;
    }
  }
  
  return periodsSince;
};

/**
 * Find periods since lowest low
 */
const periodsSinceLowestLow = (data: IndicatorInput, endIndex: number, period: number): number => {
  let lowest = Infinity;
  let periodsSince = 0;
  const startIndex = Math.max(0, endIndex - period);
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (data[i].low <= lowest) {
      lowest = data[i].low;
      periodsSince = endIndex - i;
    }
  }
  
  return periodsSince;
};

/**
 * Calculate Aroon Indicator
 * 
 * @param data - OHLCV data array
 * @param params - Aroon parameters (period)
 * @returns Object containing aroonUp and aroonDown arrays
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const aroon = calculateAroon(data, { period: 25 });
 * // Returns: { aroonUp: [...], aroonDown: [...] }
 */
export const calculateAroon = (
  data: IndicatorInput,
  params: Partial<AroonCalculationParams> = {}
): AroonOutput => {
  const { period } = { ...DEFAULT_AROON_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return { aroonUp: [], aroonDown: [] };
  }

  if (period <= 0) {
    console.warn('Aroon period must be positive');
    return { aroonUp: [], aroonDown: [] };
  }

  if (data.length < period) {
    return { aroonUp: [], aroonDown: [] };
  }

  const aroonUp: IndicatorOutput = [];
  const aroonDown: IndicatorOutput = [];

  for (let i = period; i < data.length; i++) {
    const daysSinceHigh = periodsSinceHighestHigh(data, i, period);
    const daysSinceLow = periodsSinceLowestLow(data, i, period);

    const up = ((period - daysSinceHigh) / period) * 100;
    const down = ((period - daysSinceLow) / period) * 100;

    aroonUp.push({
      time: data[i].time,
      value: up,
    });

    aroonDown.push({
      time: data[i].time,
      value: down,
    });
  }

  return { aroonUp, aroonDown };
};

/**
 * Calculate Aroon Oscillator
 * Aroon Oscillator = Aroon Up - Aroon Down
 * 
 * @param data - OHLCV data array
 * @param params - Aroon parameters (period)
 * @returns Array of {time, value} pairs
 */
export const calculateAroonOscillator = (
  data: IndicatorInput,
  params: Partial<AroonCalculationParams> = {}
): IndicatorOutput => {
  const { aroonUp, aroonDown } = calculateAroon(data, params);
  
  const result: IndicatorOutput = [];
  
  for (let i = 0; i < aroonUp.length; i++) {
    result.push({
      time: aroonUp[i].time,
      value: aroonUp[i].value - aroonDown[i].value,
    });
  }
  
  return result;
};

/**
 * Calculate Aroon from arrays (utility function)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param period - Aroon period
 * @returns Object with aroonUp and aroonDown arrays
 */
export const calculateAroonFromValues = (
  highs: number[],
  lows: number[],
  period: number
): { aroonUp: number[]; aroonDown: number[] } => {
  if (!highs || !lows || highs.length === 0) {
    return { aroonUp: [], aroonDown: [] };
  }

  if (highs.length !== lows.length) {
    console.warn('Aroon: highs and lows must have same length');
    return { aroonUp: [], aroonDown: [] };
  }

  const aroonUp: number[] = [];
  const aroonDown: number[] = [];

  for (let i = 0; i < highs.length; i++) {
    if (i < period) {
      aroonUp.push(NaN);
      aroonDown.push(NaN);
    } else {
      // Find periods since highest high
      let highest = -Infinity;
      let daysSinceHigh = 0;
      for (let j = i - period; j <= i; j++) {
        if (highs[j] >= highest) {
          highest = highs[j];
          daysSinceHigh = i - j;
        }
      }

      // Find periods since lowest low
      let lowest = Infinity;
      let daysSinceLow = 0;
      for (let j = i - period; j <= i; j++) {
        if (lows[j] <= lowest) {
          lowest = lows[j];
          daysSinceLow = i - j;
        }
      }

      aroonUp.push(((period - daysSinceHigh) / period) * 100);
      aroonDown.push(((period - daysSinceLow) / period) * 100);
    }
  }

  return { aroonUp, aroonDown };
};

/**
 * Get Aroon signal
 * 
 * @param aroonUp - Aroon Up value
 * @param aroonDown - Aroon Down value
 * @returns 'bullish', 'bearish', or 'neutral'
 */
export const getAroonSignal = (
  aroonUp: number,
  aroonDown: number
): 'bullish' | 'bearish' | 'neutral' => {
  if (aroonUp > AROON_LEVELS.STRONG && aroonDown < AROON_LEVELS.WEAK) {
    return 'bullish';
  } else if (aroonDown > AROON_LEVELS.STRONG && aroonUp < AROON_LEVELS.WEAK) {
    return 'bearish';
  }
  return 'neutral';
};
