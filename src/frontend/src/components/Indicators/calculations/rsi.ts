/**
 * Relative Strength Index (RSI) Indicator Calculation
 * 
 * Formula:
 *   RS = Average Gain / Average Loss
 *   RSI = 100 - (100 / (1 + RS))
 * 
 * The RSI measures the magnitude of recent price changes to evaluate 
 * overbought or oversold conditions.
 * 
 * Parameters:
 *   - Period: 14 (default)
 * 
 * Range: 0-100
 *   - Overbought: > 70
 *   - Oversold: < 30
 *
 * TASK-041: RSI Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, RSICalculationParams, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';

/**
 * Default RSI parameters
 */
export const DEFAULT_RSI_PARAMS: RSICalculationParams = {
  period: 14,
};

/**
 * RSI reference levels
 */
export const RSI_LEVELS = {
  OVERBOUGHT: 70,
  OVERSOLD: 30,
};

/**
 * Calculate Relative Strength Index
 * 
 * @param data - OHLCV data array
 * @param params - RSI parameters (period)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const rsi = calculateRSI(data, { period: 14 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateRSI = (
  data: IndicatorInput,
  params: Partial<RSICalculationParams> = {}
): IndicatorOutput => {
  const { period } = { ...DEFAULT_RSI_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('RSI period must be positive');
    return [];
  }

  if (data.length < period + 1) {
    // Need at least period + 1 data points to calculate first RSI
    return [];
  }

  const prices = extractPrices(data, 'close' as PriceSource);
  const times = extractTimes(data);
  const result: IndicatorOutput = [];

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // Calculate initial average gain and loss using simple average
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Calculate first RSI
  let rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));

  result.push({
    time: times[period],
    value: rsi,
  });

  // Calculate subsequent RSI values using Wilder's smoothing (exponential)
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    // Wilder's smoothing: avgGain = (prevAvgGain * (period - 1) + currentGain) / period
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    // Calculate RSI
    if (avgLoss === 0) {
      rsi = 100;
    } else {
      rs = avgGain / avgLoss;
      rsi = 100 - (100 / (1 + rs));
    }

    result.push({
      time: times[i + 1],
      value: rsi,
    });
  }

  return result;
};

/**
 * Calculate RSI from an array of numbers (utility function)
 * Used internally by other indicators like Stochastic RSI
 * 
 * @param values - Array of numeric values (typically closing prices)
 * @param period - RSI period
 * @returns Array of RSI values (same length as input, with NaN for insufficient data)
 */
export const calculateRSIFromValues = (values: number[], period: number): number[] => {
  if (!values || values.length === 0 || period <= 0) {
    return [];
  }

  if (values.length < period + 1) {
    return values.map(() => NaN);
  }

  const result: number[] = [];

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < values.length; i++) {
    changes.push(values[i] - values[i - 1]);
  }

  // Fill NaN for insufficient data
  for (let i = 0; i < period; i++) {
    result.push(NaN);
  }

  // Calculate initial average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Calculate first RSI
  let rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  result.push(rsi);

  // Calculate subsequent RSI values
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi = 100;
    } else {
      rs = avgGain / avgLoss;
      rsi = 100 - (100 / (1 + rs));
    }

    result.push(rsi);
  }

  return result;
};

/**
 * Get RSI signal based on value
 * 
 * @param rsiValue - RSI value
 * @returns 'overbought', 'oversold', or 'neutral'
 */
export const getRSISignal = (rsiValue: number): 'overbought' | 'oversold' | 'neutral' => {
  if (rsiValue >= RSI_LEVELS.OVERBOUGHT) {
    return 'overbought';
  } else if (rsiValue <= RSI_LEVELS.OVERSOLD) {
    return 'oversold';
  }
  return 'neutral';
};
