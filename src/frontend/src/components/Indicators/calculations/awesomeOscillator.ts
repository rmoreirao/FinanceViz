/**
 * Awesome Oscillator (AO) Indicator Calculation
 * 
 * Formula: AO = SMA(Median Price, 5) - SMA(Median Price, 34)
 * Median Price = (High + Low) / 2
 * 
 * The Awesome Oscillator is a momentum indicator that compares recent 
 * market momentum with the general momentum over a wider time frame.
 * 
 * Parameters:
 *   - Fast Period: 5 (default)
 *   - Slow Period: 34 (default)
 * 
 * Display: Histogram with color based on direction
 *   - Green: Current bar > Previous bar
 *   - Red: Current bar < Previous bar
 *
 * TASK-055: Awesome Oscillator Calculation
 */

import type { IndicatorInput, IndicatorOutput, AwesomeOscillatorCalculationParams } from './types';
import { calculateSMAFromValues } from './sma';

/**
 * Default Awesome Oscillator parameters
 */
export const DEFAULT_AO_PARAMS: AwesomeOscillatorCalculationParams = {
  fastPeriod: 5,
  slowPeriod: 34,
};

/**
 * Awesome Oscillator output with color information
 */
export interface AwesomeOscillatorOutput {
  values: IndicatorOutput;
  colors: ('green' | 'red')[];
}

/**
 * Calculate median price: (High + Low) / 2
 */
const getMedianPrice = (high: number, low: number): number => {
  return (high + low) / 2;
};

/**
 * Calculate Awesome Oscillator
 * 
 * @param data - OHLCV data array
 * @param params - AO parameters (fastPeriod, slowPeriod)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const ao = calculateAwesomeOscillator(data, { fastPeriod: 5, slowPeriod: 34 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateAwesomeOscillator = (
  data: IndicatorInput,
  params: Partial<AwesomeOscillatorCalculationParams> = {}
): IndicatorOutput => {
  const { fastPeriod, slowPeriod } = { ...DEFAULT_AO_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (fastPeriod <= 0 || slowPeriod <= 0) {
    console.warn('Awesome Oscillator periods must be positive');
    return [];
  }

  if (fastPeriod >= slowPeriod) {
    console.warn('Awesome Oscillator fast period should be less than slow period');
  }

  if (data.length < slowPeriod) {
    return [];
  }

  // Calculate median prices
  const medianPrices = data.map(candle => getMedianPrice(candle.high, candle.low));

  // Calculate fast and slow SMAs
  const fastSMA = calculateSMAFromValues(medianPrices, fastPeriod);
  const slowSMA = calculateSMAFromValues(medianPrices, slowPeriod);

  const result: IndicatorOutput = [];

  // AO = Fast SMA - Slow SMA
  for (let i = 0; i < data.length; i++) {
    if (!isNaN(fastSMA[i]) && !isNaN(slowSMA[i])) {
      result.push({
        time: data[i].time,
        value: fastSMA[i] - slowSMA[i],
      });
    }
  }

  return result;
};

/**
 * Calculate Awesome Oscillator with color information
 * 
 * @param data - OHLCV data array
 * @param params - AO parameters (fastPeriod, slowPeriod)
 * @returns Object with values and colors arrays
 */
export const calculateAwesomeOscillatorWithColors = (
  data: IndicatorInput,
  params: Partial<AwesomeOscillatorCalculationParams> = {}
): AwesomeOscillatorOutput => {
  const values = calculateAwesomeOscillator(data, params);
  const colors: ('green' | 'red')[] = [];

  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      // First bar: color based on sign
      colors.push(values[i].value >= 0 ? 'green' : 'red');
    } else {
      // Subsequent bars: color based on direction
      colors.push(values[i].value >= values[i - 1].value ? 'green' : 'red');
    }
  }

  return { values, colors };
};

/**
 * Calculate AO from arrays (utility function)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param fastPeriod - Fast SMA period
 * @param slowPeriod - Slow SMA period
 * @returns Array of AO values
 */
export const calculateAwesomeOscillatorFromValues = (
  highs: number[],
  lows: number[],
  fastPeriod: number = DEFAULT_AO_PARAMS.fastPeriod,
  slowPeriod: number = DEFAULT_AO_PARAMS.slowPeriod
): number[] => {
  if (!highs || !lows || highs.length === 0) {
    return [];
  }

  if (highs.length !== lows.length) {
    console.warn('Awesome Oscillator: highs and lows must have same length');
    return [];
  }

  // Calculate median prices
  const medianPrices = highs.map((h, i) => getMedianPrice(h, lows[i]));

  // Calculate fast and slow SMAs
  const fastSMA = calculateSMAFromValues(medianPrices, fastPeriod);
  const slowSMA = calculateSMAFromValues(medianPrices, slowPeriod);

  // AO = Fast SMA - Slow SMA
  const result: number[] = [];
  for (let i = 0; i < highs.length; i++) {
    if (isNaN(fastSMA[i]) || isNaN(slowSMA[i])) {
      result.push(NaN);
    } else {
      result.push(fastSMA[i] - slowSMA[i]);
    }
  }

  return result;
};

/**
 * Get Awesome Oscillator signal
 * 
 * @param currentValue - Current AO value
 * @param prevValue - Previous AO value
 * @returns 'bullish', 'bearish', or 'neutral'
 */
export const getAwesomeOscillatorSignal = (
  currentValue: number,
  prevValue: number
): 'bullish' | 'bearish' | 'neutral' => {
  // Saucer setup: AO is above zero and rising after a dip
  if (currentValue > 0 && currentValue > prevValue) {
    return 'bullish';
  } else if (currentValue < 0 && currentValue < prevValue) {
    return 'bearish';
  }
  return 'neutral';
};

/**
 * Detect zero line crossover
 * 
 * @param currentValue - Current AO value
 * @param prevValue - Previous AO value
 * @returns 'bullish_cross', 'bearish_cross', or null
 */
export const detectZeroLineCross = (
  currentValue: number,
  prevValue: number
): 'bullish_cross' | 'bearish_cross' | null => {
  if (prevValue < 0 && currentValue >= 0) {
    return 'bullish_cross';
  } else if (prevValue > 0 && currentValue <= 0) {
    return 'bearish_cross';
  }
  return null;
};
