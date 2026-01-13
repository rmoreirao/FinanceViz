/**
 * Moving Average Convergence Divergence (MACD) Indicator Calculation
 * 
 * Components:
 *   - MACD Line: EMA(12) - EMA(26)
 *   - Signal Line: EMA(9) of MACD Line
 *   - Histogram: MACD Line - Signal Line
 * 
 * Parameters:
 *   - Fast Period: 12 (default)
 *   - Slow Period: 26 (default)
 *   - Signal Period: 9 (default)
 *
 * TASK-042: MACD Indicator Calculation
 */

import type { IndicatorInput, MACDCalculationParams, MACDOutput, IndicatorOutput, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';
import { calculateEMAFromValues } from './ema';

/**
 * Default MACD parameters
 */
export const DEFAULT_MACD_PARAMS: MACDCalculationParams = {
  fastPeriod: 12,
  slowPeriod: 26,
  signalPeriod: 9,
};

/**
 * Calculate Moving Average Convergence Divergence
 * 
 * @param data - OHLCV data array
 * @param params - MACD parameters (fastPeriod, slowPeriod, signalPeriod)
 * @returns Object containing macdLine, signalLine, and histogram
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const macd = calculateMACD(data, { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 });
 * // Returns: { macdLine: [...], signalLine: [...], histogram: [...] }
 */
export const calculateMACD = (
  data: IndicatorInput,
  params: Partial<MACDCalculationParams> = {}
): MACDOutput => {
  const { fastPeriod, slowPeriod, signalPeriod } = { ...DEFAULT_MACD_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  if (fastPeriod <= 0 || slowPeriod <= 0 || signalPeriod <= 0) {
    console.warn('MACD periods must be positive');
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  if (fastPeriod >= slowPeriod) {
    console.warn('MACD fast period should be less than slow period');
  }

  // Need at least slowPeriod data points to calculate MACD
  if (data.length < slowPeriod) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  const prices = extractPrices(data, 'close' as PriceSource);
  const times = extractTimes(data);

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMAFromValues(prices, fastPeriod);
  const slowEMA = calculateEMAFromValues(prices, slowPeriod);

  // Calculate MACD Line: Fast EMA - Slow EMA
  const macdValues: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdValues.push(NaN);
    } else {
      macdValues.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Calculate Signal Line: EMA of MACD Line
  const signalValues = calculateEMAFromValues(
    macdValues.filter(v => !isNaN(v)),
    signalPeriod
  );

  // Build output arrays
  const macdLine: IndicatorOutput = [];
  const signalLine: IndicatorOutput = [];
  const histogram: IndicatorOutput = [];

  // Find the starting index where we have valid MACD values
  let macdStartIndex = -1;
  for (let i = 0; i < macdValues.length; i++) {
    if (!isNaN(macdValues[i])) {
      macdStartIndex = i;
      break;
    }
  }

  if (macdStartIndex === -1) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  // Build MACD line output
  for (let i = macdStartIndex; i < macdValues.length; i++) {
    macdLine.push({
      time: times[i],
      value: macdValues[i],
    });
  }

  // Build Signal line and Histogram output
  // Signal line starts after signalPeriod - 1 valid MACD values
  const signalStartIndex = macdStartIndex + signalPeriod - 1;
  
  let signalIdx = 0;
  for (let i = macdStartIndex; i < macdValues.length; i++) {
    if (i >= signalStartIndex && signalIdx < signalValues.length) {
      const signalValue = signalValues[signalIdx];
      
      if (!isNaN(signalValue)) {
        signalLine.push({
          time: times[i],
          value: signalValue,
        });

        histogram.push({
          time: times[i],
          value: macdValues[i] - signalValue,
        });
      }
      
      signalIdx++;
    }
  }

  return { macdLine, signalLine, histogram };
};

/**
 * Calculate MACD from an array of numbers (utility function)
 * 
 * @param values - Array of numeric values (typically closing prices)
 * @param fastPeriod - Fast EMA period
 * @param slowPeriod - Slow EMA period
 * @param signalPeriod - Signal line EMA period
 * @returns Object with macd, signal, histogram arrays
 */
export const calculateMACDFromValues = (
  values: number[],
  fastPeriod: number = DEFAULT_MACD_PARAMS.fastPeriod,
  slowPeriod: number = DEFAULT_MACD_PARAMS.slowPeriod,
  signalPeriod: number = DEFAULT_MACD_PARAMS.signalPeriod
): { macd: number[]; signal: number[]; histogram: number[] } => {
  if (!values || values.length === 0) {
    return { macd: [], signal: [], histogram: [] };
  }

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMAFromValues(values, fastPeriod);
  const slowEMA = calculateEMAFromValues(values, slowPeriod);

  // Calculate MACD Line
  const macd: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macd.push(NaN);
    } else {
      macd.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Calculate Signal Line from valid MACD values
  const validMacd = macd.filter(v => !isNaN(v));
  const signalFromValid = calculateEMAFromValues(validMacd, signalPeriod);
  
  // Map signal values back to original indices
  const signal: number[] = [];
  const histogram: number[] = [];
  let validIdx = 0;
  
  for (let i = 0; i < macd.length; i++) {
    if (isNaN(macd[i])) {
      signal.push(NaN);
      histogram.push(NaN);
    } else {
      if (validIdx < signalFromValid.length) {
        const sig = signalFromValid[validIdx];
        signal.push(sig);
        histogram.push(isNaN(sig) ? NaN : macd[i] - sig);
        validIdx++;
      } else {
        signal.push(NaN);
        histogram.push(NaN);
      }
    }
  }

  return { macd, signal, histogram };
};

/**
 * Get MACD signal based on histogram direction
 * 
 * @param histogram - Current histogram value
 * @param prevHistogram - Previous histogram value
 * @returns 'bullish', 'bearish', or 'neutral'
 */
export const getMACDSignal = (
  histogram: number,
  prevHistogram: number
): 'bullish' | 'bearish' | 'neutral' => {
  if (histogram > 0 && histogram > prevHistogram) {
    return 'bullish';
  } else if (histogram < 0 && histogram < prevHistogram) {
    return 'bearish';
  }
  return 'neutral';
};
