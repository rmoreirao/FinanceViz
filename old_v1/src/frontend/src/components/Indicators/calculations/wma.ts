/**
 * Weighted Moving Average (WMA) Calculation
 * Formula: WMA = (P1 × n + P2 × (n-1) + ... + Pn × 1) / (n × (n+1) / 2)
 */

import type { OHLCV, WMAParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Weighted Moving Average
 * @param data - OHLCV data array
 * @param params - WMA parameters (period)
 * @returns Array of WMA values
 */
export function calculateWMA(data: OHLCV[], params: WMAParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];
  
  if (data.length < period) {
    return result;
  }
  
  // Calculate the weight denominator: n × (n+1) / 2
  const weightSum = (period * (period + 1)) / 2;
  
  // Calculate WMA for each valid point
  for (let i = period - 1; i < data.length; i++) {
    let weightedSum = 0;
    
    for (let j = 0; j < period; j++) {
      // Weight = (period - j), so newest price has highest weight
      const weight = period - j;
      weightedSum += data[i - j].close * weight;
    }
    
    result.push({
      time: data[i].time,
      value: weightedSum / weightSum,
    });
  }
  
  return result;
}

/**
 * WMA indicator definition with metadata
 */
export const wmaIndicator: IndicatorDefinition<WMAParams, IndicatorValue> = {
  meta: {
    type: 'WMA',
    name: 'Weighted Moving Average',
    shortName: 'WMA',
    category: 'overlay',
    defaultParams: { period: 20 },
    defaultColor: '#00C853',
    description: 'Moving average that assigns greater weight to recent data',
  },
  calculate: calculateWMA,
};
