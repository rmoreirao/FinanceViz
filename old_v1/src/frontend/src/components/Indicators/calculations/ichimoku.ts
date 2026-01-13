/**
 * Ichimoku Cloud (Ichimoku Kinko Hyo) Calculation
 * Components:
 * - Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
 * - Kijun-sen (Base Line): (26-period high + 26-period low) / 2
 * - Senkou Span A (Leading Span A): (Tenkan-sen + Kijun-sen) / 2, plotted 26 periods ahead
 * - Senkou Span B (Leading Span B): (52-period high + 52-period low) / 2, plotted 26 periods ahead
 * - Chikou Span (Lagging Span): Close price, plotted 26 periods behind
 */

import type { OHLCV, IchimokuParams } from '../../../types';
import type { IchimokuValue, IndicatorDefinition } from './types';

/**
 * Calculate the midpoint (high + low) / 2 for a given period
 */
function calculateMidpoint(data: OHLCV[], endIndex: number, period: number): number {
  let highest = -Infinity;
  let lowest = Infinity;
  
  const startIndex = Math.max(0, endIndex - period + 1);
  
  for (let i = startIndex; i <= endIndex; i++) {
    if (data[i].high > highest) highest = data[i].high;
    if (data[i].low < lowest) lowest = data[i].low;
  }
  
  return (highest + lowest) / 2;
}

/**
 * Calculate Ichimoku Cloud
 * @param data - OHLCV data array
 * @param params - Ichimoku parameters (tenkan, kijun, senkou)
 * @returns Array of Ichimoku values
 */
export function calculateIchimoku(
  data: OHLCV[],
  params: IchimokuParams
): IchimokuValue[] {
  const { tenkan, kijun, senkou } = params;
  const result: IchimokuValue[] = [];
  
  // Need at least senkou periods of data
  if (data.length < senkou) {
    return result;
  }
  
  // Pre-calculate all Tenkan-sen and Kijun-sen values
  const tenkanValues: (number | null)[] = [];
  const kijunValues: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i >= tenkan - 1) {
      tenkanValues.push(calculateMidpoint(data, i, tenkan));
    } else {
      tenkanValues.push(null);
    }
    
    if (i >= kijun - 1) {
      kijunValues.push(calculateMidpoint(data, i, kijun));
    } else {
      kijunValues.push(null);
    }
  }
  
  // Calculate all Ichimoku values
  for (let i = senkou - 1; i < data.length; i++) {
    const tenkanSen = tenkanValues[i] ?? 0;
    const kijunSen = kijunValues[i] ?? 0;
    
    // Senkou Span A: average of Tenkan and Kijun, shifted forward by kijun periods
    // For current calculation, we look back kijun periods
    const senkouAIndex = i - kijun;
    let senkouSpanA = 0;
    if (senkouAIndex >= 0 && tenkanValues[senkouAIndex] !== null && kijunValues[senkouAIndex] !== null) {
      senkouSpanA = (tenkanValues[senkouAIndex]! + kijunValues[senkouAIndex]!) / 2;
    }
    
    // Senkou Span B: 52-period midpoint, shifted forward by kijun periods
    const senkouBIndex = i - kijun;
    let senkouSpanB = 0;
    if (senkouBIndex >= senkou - 1) {
      senkouSpanB = calculateMidpoint(data, senkouBIndex, senkou);
    }
    
    // Chikou Span: current close, but shown with a lag
    // We show the close price shifted back by kijun periods
    const chikouIndex = i + kijun;
    let chikouSpan = 0;
    if (chikouIndex < data.length) {
      chikouSpan = data[chikouIndex].close;
    } else {
      // For the most recent data, use current close
      chikouSpan = data[i].close;
    }
    
    result.push({
      time: data[i].time,
      tenkanSen,
      kijunSen,
      senkouSpanA,
      senkouSpanB,
      chikouSpan,
    });
  }
  
  return result;
}

/**
 * Ichimoku Cloud indicator definition with metadata
 */
export const ichimokuIndicator: IndicatorDefinition<IchimokuParams, IchimokuValue> = {
  meta: {
    type: 'ICHIMOKU',
    name: 'Ichimoku Cloud',
    shortName: 'Ichimoku',
    category: 'overlay',
    defaultParams: { tenkan: 9, kijun: 26, senkou: 52 },
    defaultColor: '#607D8B',
    description: 'Comprehensive indicator showing support, resistance, trend, and momentum',
    outputs: ['tenkanSen', 'kijunSen', 'senkouSpanA', 'senkouSpanB', 'chikouSpan'],
  },
  calculate: calculateIchimoku,
};
