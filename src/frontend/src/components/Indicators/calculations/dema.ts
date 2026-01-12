/**
 * Double Exponential Moving Average (DEMA) Calculation
 * Formula: DEMA = 2 × EMA - EMA(EMA)
 */

import type { OHLCV, DEMAParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';
import { calculateEMAFromValues } from './ema';

/**
 * Calculate Double Exponential Moving Average
 * @param data - OHLCV data array
 * @param params - DEMA parameters (period)
 * @returns Array of DEMA values
 */
export function calculateDEMA(data: OHLCV[], params: DEMAParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];
  
  if (data.length < period * 2 - 1) {
    return result;
  }
  
  // Extract close prices
  const closes = data.map(d => d.close);
  
  // Calculate EMA
  const ema1 = calculateEMAFromValues(closes, period);
  
  // Calculate EMA of EMA
  const ema2 = calculateEMAFromValues(ema1, period);
  
  // Calculate DEMA: 2 × EMA - EMA(EMA)
  // The offset is period - 1 for the first EMA calculation
  const offset = period - 1;
  
  for (let i = 0; i < ema2.length; i++) {
    // The corresponding ema1 index
    const ema1Index = i + (period - 1);
    
    // The corresponding data index
    const dataIndex = offset + ema1Index;
    
    if (dataIndex < data.length) {
      result.push({
        time: data[dataIndex].time,
        value: 2 * ema1[ema1Index] - ema2[i],
      });
    }
  }
  
  return result;
}

/**
 * DEMA indicator definition with metadata
 */
export const demaIndicator: IndicatorDefinition<DEMAParams, IndicatorValue> = {
  meta: {
    type: 'DEMA',
    name: 'Double Exponential Moving Average',
    shortName: 'DEMA',
    category: 'overlay',
    defaultParams: { period: 20 },
    defaultColor: '#E91E63',
    description: 'Faster moving average with reduced lag compared to EMA',
  },
  calculate: calculateDEMA,
};
