/**
 * Ichimoku Kinko Hyo (Ichimoku Cloud) Indicator Calculation
 * 
 * Components:
 *   - Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
 *   - Kijun-sen (Base Line): (26-period high + 26-period low) / 2
 *   - Senkou Span A: (Tenkan-sen + Kijun-sen) / 2, plotted 26 periods ahead
 *   - Senkou Span B: (52-period high + 52-period low) / 2, plotted 26 periods ahead
 *   - Chikou Span: Close plotted 26 periods behind
 *
 * Parameters:
 *   - Tenkan Period: 9 (default)
 *   - Kijun Period: 26 (default)
 *   - Senkou Period: 52 (default)
 *
 * TASK-040: Ichimoku Cloud Calculation
 */

import type { IndicatorInput, IchimokuCalculationParams, IchimokuOutput, IndicatorOutput } from './types';

/**
 * Default Ichimoku parameters
 */
export const DEFAULT_ICHIMOKU_PARAMS: IchimokuCalculationParams = {
  tenkanPeriod: 9,
  kijunPeriod: 26,
  senkouPeriod: 52,
};

/**
 * Calculate the highest high over a period
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
 * Calculate the lowest low over a period
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
 * Calculate Donchian midline: (highest high + lowest low) / 2
 */
const getDonchianMidline = (data: IndicatorInput, endIndex: number, period: number): number => {
  const highestHigh = getHighestHigh(data, endIndex, period);
  const lowestLow = getLowestLow(data, endIndex, period);
  return (highestHigh + lowestLow) / 2;
};

/**
 * Calculate Ichimoku Cloud indicator
 * 
 * @param data - OHLCV data array
 * @param params - Ichimoku parameters (tenkanPeriod, kijunPeriod, senkouPeriod)
 * @returns Object containing all five Ichimoku components
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const ichimoku = calculateIchimoku(data, { tenkanPeriod: 9, kijunPeriod: 26, senkouPeriod: 52 });
 * // Returns: { tenkanSen: [...], kijunSen: [...], senkouSpanA: [...], senkouSpanB: [...], chikouSpan: [...] }
 */
export const calculateIchimoku = (
  data: IndicatorInput,
  params: Partial<IchimokuCalculationParams> = {}
): IchimokuOutput => {
  const { tenkanPeriod, kijunPeriod, senkouPeriod } = { ...DEFAULT_ICHIMOKU_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return {
      tenkanSen: [],
      kijunSen: [],
      senkouSpanA: [],
      senkouSpanB: [],
      chikouSpan: [],
    };
  }

  if (tenkanPeriod <= 0 || kijunPeriod <= 0 || senkouPeriod <= 0) {
    console.warn('Ichimoku periods must be positive');
    return {
      tenkanSen: [],
      kijunSen: [],
      senkouSpanA: [],
      senkouSpanB: [],
      chikouSpan: [],
    };
  }

  const tenkanSen: IndicatorOutput = [];
  const kijunSen: IndicatorOutput = [];
  const senkouSpanA: IndicatorOutput = [];
  const senkouSpanB: IndicatorOutput = [];
  const chikouSpan: IndicatorOutput = [];

  // Calculate Tenkan-sen and Kijun-sen for each bar
  const tenkanValues: (number | null)[] = [];
  const kijunValues: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    
    // Tenkan-sen: (9-period high + 9-period low) / 2
    if (i >= tenkanPeriod - 1) {
      const tenkan = getDonchianMidline(data, i, tenkanPeriod);
      tenkanValues.push(tenkan);
      tenkanSen.push({
        time: candle.time,
        value: tenkan,
      });
    } else {
      tenkanValues.push(null);
    }
    
    // Kijun-sen: (26-period high + 26-period low) / 2
    if (i >= kijunPeriod - 1) {
      const kijun = getDonchianMidline(data, i, kijunPeriod);
      kijunValues.push(kijun);
      kijunSen.push({
        time: candle.time,
        value: kijun,
      });
    } else {
      kijunValues.push(null);
    }
    
    // Chikou Span: Close plotted 26 periods behind
    // This means the current close is shown at (current time - 26 periods)
    // We store the value at the position it should be displayed
    if (i >= kijunPeriod) {
      chikouSpan.push({
        time: data[i - kijunPeriod].time,
        value: candle.close,
      });
    }
  }

  // Calculate Senkou Span A and B
  // These are projected 26 periods into the future
  for (let i = 0; i < data.length; i++) {
    const tenkan = tenkanValues[i];
    const kijun = kijunValues[i];
    
    // Senkou Span A: (Tenkan-sen + Kijun-sen) / 2, plotted 26 periods ahead
    if (tenkan !== null && kijun !== null) {
      const spanA = (tenkan + kijun) / 2;
      
      // Calculate future time (26 periods ahead)
      const futureTime = estimateFutureTime(data, i, kijunPeriod);
      
      senkouSpanA.push({
        time: futureTime,
        value: spanA,
      });
    }
    
    // Senkou Span B: (52-period high + 52-period low) / 2, plotted 26 periods ahead
    if (i >= senkouPeriod - 1) {
      const spanB = getDonchianMidline(data, i, senkouPeriod);
      const futureTime = estimateFutureTime(data, i, kijunPeriod);
      
      senkouSpanB.push({
        time: futureTime,
        value: spanB,
      });
    }
  }

  return {
    tenkanSen,
    kijunSen,
    senkouSpanA,
    senkouSpanB,
    chikouSpan,
  };
};

/**
 * Estimate future time based on the average time increment in the data
 * 
 * @param data - OHLCV data array
 * @param currentIndex - Current bar index
 * @param periodsAhead - Number of periods to project ahead
 * @returns Estimated future timestamp
 */
const estimateFutureTime = (data: IndicatorInput, currentIndex: number, periodsAhead: number): number => {
  // Calculate average time increment from the last few bars
  let avgIncrement = 0;
  let count = 0;
  
  const lookback = Math.min(currentIndex, 10);
  for (let i = currentIndex; i > currentIndex - lookback && i > 0; i--) {
    avgIncrement += data[i].time - data[i - 1].time;
    count++;
  }
  
  if (count > 0) {
    avgIncrement /= count;
  } else if (data.length > 1) {
    // Fallback to first two bars
    avgIncrement = data[1].time - data[0].time;
  } else {
    // Default to daily (86400 seconds)
    avgIncrement = 86400;
  }
  
  return data[currentIndex].time + avgIncrement * periodsAhead;
};

/**
 * Get cloud coloring information
 * Useful for rendering the cloud with correct colors
 * 
 * @param senkouSpanA - Senkou Span A values
 * @param senkouSpanB - Senkou Span B values
 * @returns Array of 'bullish' or 'bearish' for each point
 */
export const getCloudColor = (
  senkouSpanA: IndicatorOutput,
  senkouSpanB: IndicatorOutput
): ('bullish' | 'bearish')[] => {
  const result: ('bullish' | 'bearish')[] = [];
  
  // Create a map for quick lookup by time
  const spanBMap = new Map<number, number>();
  for (const point of senkouSpanB) {
    spanBMap.set(point.time, point.value);
  }
  
  for (const pointA of senkouSpanA) {
    const valueB = spanBMap.get(pointA.time);
    if (valueB !== undefined) {
      // Cloud is bullish (green) when Span A > Span B
      result.push(pointA.value >= valueB ? 'bullish' : 'bearish');
    }
  }
  
  return result;
};
