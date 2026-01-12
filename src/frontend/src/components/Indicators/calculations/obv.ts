/**
 * OBV (On-Balance Volume) Calculation
 * Cumulative indicator that adds volume on up days and subtracts on down days
 * Formula: If Close > Previous Close: OBV = Previous OBV + Volume
 *          If Close < Previous Close: OBV = Previous OBV - Volume
 *          If Close = Previous Close: OBV = Previous OBV
 */

import type { OHLCV } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

// OBV has no parameters
export interface OBVParams {
  // No parameters needed
}

/**
 * Calculate On-Balance Volume
 * @param data - OHLCV data array
 * @returns Array of OBV values
 */
export function calculateOBV(data: OHLCV[]): IndicatorValue[] {
  const result: IndicatorValue[] = [];

  if (data.length === 0) {
    return result;
  }

  // Start with 0 OBV
  let obv = 0;

  result.push({
    time: data[0].time,
    value: obv,
  });

  for (let i = 1; i < data.length; i++) {
    const currentClose = data[i].close;
    const previousClose = data[i - 1].close;
    const volume = data[i].volume;

    if (currentClose > previousClose) {
      obv += volume;
    } else if (currentClose < previousClose) {
      obv -= volume;
    }
    // If equal, OBV stays the same

    result.push({
      time: data[i].time,
      value: obv,
    });
  }

  return result;
}

/**
 * OBV indicator definition with metadata
 */
export const obvIndicator: IndicatorDefinition<OBVParams, IndicatorValue> = {
  meta: {
    type: 'OBV',
    name: 'On-Balance Volume',
    shortName: 'OBV',
    category: 'oscillator',
    defaultParams: {},
    defaultColor: '#FF9800',
    description: 'Cumulative volume indicator tracking buying and selling pressure',
  },
  calculate: calculateOBV,
};
