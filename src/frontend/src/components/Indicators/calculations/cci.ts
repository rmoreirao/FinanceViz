/**
 * Commodity Channel Index (CCI) Indicator Calculation
 * 
 * Formula: CCI = (Typical Price - SMA of TP) / (0.015 * Mean Deviation)
 * Typical Price = (High + Low + Close) / 3
 * Mean Deviation = Average of |TP - SMA of TP|
 * 
 * CCI measures the current price level relative to an average price level
 * over a given period of time.
 * 
 * Parameters:
 *   - Period: 20 (default)
 * 
 * The 0.015 constant ensures that approximately 70-80% of CCI values
 * fall between -100 and +100.
 *
 * TASK-046: CCI Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, CCICalculationParams } from './types';

/**
 * Default CCI parameters
 */
export const DEFAULT_CCI_PARAMS: CCICalculationParams = {
  period: 20,
};

/**
 * CCI reference levels
 */
export const CCI_LEVELS = {
  OVERBOUGHT: 100,
  OVERSOLD: -100,
};

/**
 * CCI constant (Lambert's constant)
 */
const CCI_CONSTANT = 0.015;

/**
 * Calculate typical price: (High + Low + Close) / 3
 */
const getTypicalPrice = (high: number, low: number, close: number): number => {
  return (high + low + close) / 3;
};

/**
 * Calculate Commodity Channel Index
 * 
 * @param data - OHLCV data array
 * @param params - CCI parameters (period)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const cci = calculateCCI(data, { period: 20 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateCCI = (
  data: IndicatorInput,
  params: Partial<CCICalculationParams> = {}
): IndicatorOutput => {
  const { period } = { ...DEFAULT_CCI_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('CCI period must be positive');
    return [];
  }

  if (data.length < period) {
    return [];
  }

  // Calculate typical prices
  const typicalPrices: number[] = data.map(candle => 
    getTypicalPrice(candle.high, candle.low, candle.close)
  );

  const result: IndicatorOutput = [];

  for (let i = period - 1; i < data.length; i++) {
    // Calculate SMA of typical prices
    let tpSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      tpSum += typicalPrices[j];
    }
    const tpSMA = tpSum / period;

    // Calculate Mean Deviation
    let deviationSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      deviationSum += Math.abs(typicalPrices[j] - tpSMA);
    }
    const meanDeviation = deviationSum / period;

    // Calculate CCI
    let cci: number;
    if (meanDeviation === 0) {
      cci = 0;
    } else {
      cci = (typicalPrices[i] - tpSMA) / (CCI_CONSTANT * meanDeviation);
    }

    result.push({
      time: data[i].time,
      value: cci,
    });
  }

  return result;
};

/**
 * Calculate CCI from values (utility function)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of close prices
 * @param period - Lookback period
 * @returns Array of CCI values
 */
export const calculateCCIFromValues = (
  highs: number[],
  lows: number[],
  closes: number[],
  period: number
): number[] => {
  if (!highs || !lows || !closes || highs.length === 0) {
    return [];
  }

  if (highs.length !== lows.length || highs.length !== closes.length) {
    console.warn('CCI: highs, lows, and closes must have same length');
    return [];
  }

  const typicalPrices = highs.map((h, i) => getTypicalPrice(h, lows[i], closes[i]));
  const result: number[] = [];

  for (let i = 0; i < highs.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      // Calculate SMA of typical prices
      let tpSum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        tpSum += typicalPrices[j];
      }
      const tpSMA = tpSum / period;

      // Calculate Mean Deviation
      let deviationSum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        deviationSum += Math.abs(typicalPrices[j] - tpSMA);
      }
      const meanDeviation = deviationSum / period;

      // Calculate CCI
      if (meanDeviation === 0) {
        result.push(0);
      } else {
        result.push((typicalPrices[i] - tpSMA) / (CCI_CONSTANT * meanDeviation));
      }
    }
  }

  return result;
};

/**
 * Get CCI signal
 * 
 * @param value - CCI value
 * @returns 'overbought', 'oversold', or 'neutral'
 */
export const getCCISignal = (value: number): 'overbought' | 'oversold' | 'neutral' => {
  if (value >= CCI_LEVELS.OVERBOUGHT) {
    return 'overbought';
  } else if (value <= CCI_LEVELS.OVERSOLD) {
    return 'oversold';
  }
  return 'neutral';
};
