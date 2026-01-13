/**
 * Parabolic SAR (Stop and Reverse) Calculation
 * Used to identify potential reversals in price direction
 */

import type { OHLCV, ParabolicSARParams } from '../../../types';
import type { ParabolicSARValue, IndicatorDefinition } from './types';

/**
 * Calculate Parabolic SAR
 * @param data - OHLCV data array
 * @param params - Parabolic SAR parameters (step, max)
 * @returns Array of SAR values with trend direction
 */
export function calculateParabolicSAR(
  data: OHLCV[],
  params: ParabolicSARParams
): ParabolicSARValue[] {
  const { step, max } = params;
  const result: ParabolicSARValue[] = [];
  
  if (data.length < 2) {
    return result;
  }
  
  // Initialize
  let isUptrend = data[1].close > data[0].close;
  let af = step;  // Acceleration Factor
  let ep = isUptrend ? data[0].high : data[0].low;  // Extreme Point
  let sar = isUptrend ? data[0].low : data[0].high;
  
  // First value
  result.push({
    time: data[0].time,
    value: sar,
    trend: isUptrend ? 'up' : 'down',
  });
  
  for (let i = 1; i < data.length; i++) {
    const bar = data[i];
    const prevBar = data[i - 1];
    
    // Calculate new SAR
    let newSar = sar + af * (ep - sar);
    
    // Ensure SAR is within bounds
    if (isUptrend) {
      // SAR should not be above prior two lows
      newSar = Math.min(newSar, prevBar.low);
      if (i >= 2) {
        newSar = Math.min(newSar, data[i - 2].low);
      }
      
      // Check for reversal
      if (bar.low < newSar) {
        // Switch to downtrend
        isUptrend = false;
        newSar = ep;  // SAR = previous extreme point
        af = step;
        ep = bar.low;
      } else {
        // Update EP and AF
        if (bar.high > ep) {
          ep = bar.high;
          af = Math.min(af + step, max);
        }
      }
    } else {
      // SAR should not be below prior two highs
      newSar = Math.max(newSar, prevBar.high);
      if (i >= 2) {
        newSar = Math.max(newSar, data[i - 2].high);
      }
      
      // Check for reversal
      if (bar.high > newSar) {
        // Switch to uptrend
        isUptrend = true;
        newSar = ep;  // SAR = previous extreme point
        af = step;
        ep = bar.high;
      } else {
        // Update EP and AF
        if (bar.low < ep) {
          ep = bar.low;
          af = Math.min(af + step, max);
        }
      }
    }
    
    sar = newSar;
    
    result.push({
      time: bar.time,
      value: sar,
      trend: isUptrend ? 'up' : 'down',
    });
  }
  
  return result;
}

/**
 * Parabolic SAR indicator definition with metadata
 */
export const parabolicSarIndicator: IndicatorDefinition<ParabolicSARParams, ParabolicSARValue> = {
  meta: {
    type: 'SAR',
    name: 'Parabolic SAR',
    shortName: 'SAR',
    category: 'overlay',
    defaultParams: { step: 0.02, max: 0.2 },
    defaultColor: '#FF5722',
    description: 'Trailing stop and reverse indicator for trend following',
  },
  calculate: calculateParabolicSAR,
};
