/**
 * Triple Exponential Moving Average (TEMA) Calculation
 * Formula: TEMA = 3×EMA - 3×EMA(EMA) + EMA(EMA(EMA))
 */

import type { OHLCV, TEMAParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';
import { calculateEMAFromValues } from './ema';

/**
 * Calculate Triple Exponential Moving Average
 * @param data - OHLCV data array
 * @param params - TEMA parameters (period)
 * @returns Array of TEMA values
 */
export function calculateTEMA(data: OHLCV[], params: TEMAParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];
  
  // Need at least 3 × period - 2 data points
  if (data.length < period * 3 - 2) {
    return result;
  }
  
  // Extract close prices
  const closes = data.map(d => d.close);
  
  // Calculate EMA
  const ema1 = calculateEMAFromValues(closes, period);
  
  // Calculate EMA of EMA
  const ema2 = calculateEMAFromValues(ema1, period);
  
  // Calculate EMA of EMA of EMA
  const ema3 = calculateEMAFromValues(ema2, period);
  
  // Calculate TEMA: 3×EMA - 3×EMA(EMA) + EMA(EMA(EMA))
  // Need to align the indices properly
  const offset1 = period - 1;  // First EMA offset
  const offset3 = offset1 * 3;  // Third EMA total offset
  
  for (let i = 0; i < ema3.length; i++) {
    // Corresponding indices in ema1 and ema2
    const ema2Index = i + (period - 1);
    const ema1Index = ema2Index + (period - 1);
    
    // Corresponding data index
    const dataIndex = offset3 - offset1 + i;
    
    if (dataIndex < data.length && ema1Index < ema1.length && ema2Index < ema2.length) {
      result.push({
        time: data[dataIndex].time,
        value: 3 * ema1[ema1Index] - 3 * ema2[ema2Index] + ema3[i],
      });
    }
  }
  
  return result;
}

/**
 * TEMA indicator definition with metadata
 */
export const temaIndicator: IndicatorDefinition<TEMAParams, IndicatorValue> = {
  meta: {
    type: 'TEMA',
    name: 'Triple Exponential Moving Average',
    shortName: 'TEMA',
    category: 'overlay',
    defaultParams: { period: 20 },
    defaultColor: '#673AB7',
    description: 'Even faster moving average with minimal lag',
  },
  calculate: calculateTEMA,
};
