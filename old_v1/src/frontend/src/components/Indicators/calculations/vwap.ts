/**
 * Volume Weighted Average Price (VWAP) Calculation
 * Formula: VWAP = Cumulative(TypicalPrice × Volume) / Cumulative(Volume)
 * TypicalPrice = (High + Low + Close) / 3
 */

import type { OHLCV } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

// Empty params interface since VWAP has no parameters
export interface VWAPParams {
  // No parameters - session-based calculation
}

/**
 * Calculate Volume Weighted Average Price
 * @param data - OHLCV data array
 * @param _params - VWAP has no parameters
 * @returns Array of VWAP values
 */
export function calculateVWAP(data: OHLCV[], _params: VWAPParams): IndicatorValue[] {
  const result: IndicatorValue[] = [];
  
  if (data.length === 0) {
    return result;
  }
  
  let cumulativeTPV = 0;  // Cumulative Typical Price × Volume
  let cumulativeVolume = 0;
  
  for (let i = 0; i < data.length; i++) {
    const bar = data[i];
    
    // Calculate typical price
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    
    // Accumulate values
    cumulativeTPV += typicalPrice * bar.volume;
    cumulativeVolume += bar.volume;
    
    // Calculate VWAP
    const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;
    
    result.push({
      time: bar.time,
      value: vwap,
    });
  }
  
  return result;
}

/**
 * VWAP indicator definition with metadata
 */
export const vwapIndicator: IndicatorDefinition<VWAPParams, IndicatorValue> = {
  meta: {
    type: 'VWAP',
    name: 'Volume Weighted Average Price',
    shortName: 'VWAP',
    category: 'overlay',
    defaultParams: {},
    defaultColor: '#00BCD4',
    description: 'Average price weighted by volume, often used as a trading benchmark',
  },
  calculate: calculateVWAP,
};
