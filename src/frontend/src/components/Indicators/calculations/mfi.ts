/**
 * Money Flow Index (MFI) Indicator Calculation
 * 
 * Formula:
 *   Typical Price = (High + Low + Close) / 3
 *   Raw Money Flow = Typical Price * Volume
 *   Money Flow Ratio = Positive Money Flow / Negative Money Flow
 *   MFI = 100 - (100 / (1 + Money Flow Ratio))
 * 
 * MFI is a volume-weighted version of RSI. It measures buying and 
 * selling pressure using price and volume.
 * 
 * Parameters:
 *   - Period: 14 (default)
 * 
 * Range: 0-100
 *   - Overbought: > 80
 *   - Oversold: < 20
 *
 * TASK-053: MFI Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput, MFICalculationParams } from './types';

/**
 * Default MFI parameters
 */
export const DEFAULT_MFI_PARAMS: MFICalculationParams = {
  period: 14,
};

/**
 * MFI reference levels
 */
export const MFI_LEVELS = {
  OVERBOUGHT: 80,
  OVERSOLD: 20,
};

/**
 * Calculate typical price: (High + Low + Close) / 3
 */
const getTypicalPrice = (high: number, low: number, close: number): number => {
  return (high + low + close) / 3;
};

/**
 * Calculate Money Flow Index
 * 
 * @param data - OHLCV data array
 * @param params - MFI parameters (period)
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const mfi = calculateMFI(data, { period: 14 });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateMFI = (
  data: IndicatorInput,
  params: Partial<MFICalculationParams> = {}
): IndicatorOutput => {
  const { period } = { ...DEFAULT_MFI_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  if (period <= 0) {
    console.warn('MFI period must be positive');
    return [];
  }

  if (data.length < period + 1) {
    return [];
  }

  // Calculate typical prices and raw money flow
  const typicalPrices: number[] = data.map(candle => 
    getTypicalPrice(candle.high, candle.low, candle.close)
  );
  
  const rawMoneyFlow: number[] = data.map((candle, i) => 
    typicalPrices[i] * candle.volume
  );

  const result: IndicatorOutput = [];

  for (let i = period; i < data.length; i++) {
    let positiveMF = 0;
    let negativeMF = 0;

    // Sum positive and negative money flows over the period
    for (let j = i - period + 1; j <= i; j++) {
      if (typicalPrices[j] > typicalPrices[j - 1]) {
        positiveMF += rawMoneyFlow[j];
      } else if (typicalPrices[j] < typicalPrices[j - 1]) {
        negativeMF += rawMoneyFlow[j];
      }
      // If TP unchanged, money flow is neutral
    }

    // Calculate MFI
    let mfi: number;
    if (negativeMF === 0) {
      mfi = 100;
    } else if (positiveMF === 0) {
      mfi = 0;
    } else {
      const moneyFlowRatio = positiveMF / negativeMF;
      mfi = 100 - (100 / (1 + moneyFlowRatio));
    }

    result.push({
      time: data[i].time,
      value: mfi,
    });
  }

  return result;
};

/**
 * Calculate MFI from arrays (utility function)
 * 
 * @param highs - Array of high prices
 * @param lows - Array of low prices
 * @param closes - Array of close prices
 * @param volumes - Array of volumes
 * @param period - MFI period
 * @returns Array of MFI values
 */
export const calculateMFIFromValues = (
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
    console.warn('MFI: All arrays must have same length');
    return [];
  }

  // Calculate typical prices and raw money flow
  const typicalPrices = highs.map((h, i) => getTypicalPrice(h, lows[i], closes[i]));
  const rawMoneyFlow = typicalPrices.map((tp, i) => tp * volumes[i]);

  const result: number[] = [];

  for (let i = 0; i < highs.length; i++) {
    if (i < period) {
      result.push(NaN);
    } else {
      let positiveMF = 0;
      let negativeMF = 0;

      for (let j = i - period + 1; j <= i; j++) {
        if (typicalPrices[j] > typicalPrices[j - 1]) {
          positiveMF += rawMoneyFlow[j];
        } else if (typicalPrices[j] < typicalPrices[j - 1]) {
          negativeMF += rawMoneyFlow[j];
        }
      }

      let mfi: number;
      if (negativeMF === 0) {
        mfi = 100;
      } else if (positiveMF === 0) {
        mfi = 0;
      } else {
        const moneyFlowRatio = positiveMF / negativeMF;
        mfi = 100 - (100 / (1 + moneyFlowRatio));
      }

      result.push(mfi);
    }
  }

  return result;
};

/**
 * Get MFI signal
 * 
 * @param value - MFI value
 * @returns 'overbought', 'oversold', or 'neutral'
 */
export const getMFISignal = (value: number): 'overbought' | 'oversold' | 'neutral' => {
  if (value >= MFI_LEVELS.OVERBOUGHT) {
    return 'overbought';
  } else if (value <= MFI_LEVELS.OVERSOLD) {
    return 'oversold';
  }
  return 'neutral';
};
