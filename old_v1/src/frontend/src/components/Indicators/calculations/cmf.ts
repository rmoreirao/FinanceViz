/**
 * CMF (Chaikin Money Flow) Calculation
 * Measures the amount of Money Flow Volume over a specific period
 * Formula: CMF = Sum(Money Flow Volume) / Sum(Volume)
 * Money Flow Multiplier = ((Close - Low) - (High - Close)) / (High - Low)
 * Money Flow Volume = Money Flow Multiplier × Volume
 */

import type { OHLCV, CMFParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Chaikin Money Flow
 * @param data - OHLCV data array
 * @param params - CMF parameters (period)
 * @returns Array of CMF values (-1 to 1)
 */
export function calculateCMF(data: OHLCV[], params: CMFParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];

  if (data.length < period) {
    return result;
  }

  // Calculate Money Flow Volume for each bar
  const mfv: number[] = data.map(d => {
    const highLowRange = d.high - d.low;
    if (highLowRange === 0) {
      return 0;
    }
    // Money Flow Multiplier
    const mfm = ((d.close - d.low) - (d.high - d.close)) / highLowRange;
    // Money Flow Volume
    return mfm * d.volume;
  });

  // Calculate CMF for each period
  for (let i = period - 1; i < data.length; i++) {
    let sumMFV = 0;
    let sumVolume = 0;

    for (let j = i - period + 1; j <= i; j++) {
      sumMFV += mfv[j];
      sumVolume += data[j].volume;
    }

    const cmf = sumVolume === 0 ? 0 : sumMFV / sumVolume;

    result.push({
      time: data[i].time,
      value: cmf,
    });
  }

  return result;
}

/**
 * CMF indicator definition with metadata
 */
export const cmfIndicator: IndicatorDefinition<CMFParams, IndicatorValue> = {
  meta: {
    type: 'CMF',
    name: 'Chaikin Money Flow',
    shortName: 'CMF',
    category: 'oscillator',
    defaultParams: { period: 20 },
    defaultColor: '#9C27B0',
    description: 'Measures buying and selling pressure over a period (-1 to 1)',
  },
  calculate: calculateCMF,
};
