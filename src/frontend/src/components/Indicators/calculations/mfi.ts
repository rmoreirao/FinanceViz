/**
 * MFI (Money Flow Index) Calculation
 * Volume-weighted version of RSI
 * Formula: MFI = 100 - (100 / (1 + Money Flow Ratio))
 * Money Flow = Typical Price × Volume
 * Money Flow Ratio = Positive MF / Negative MF
 */

import type { OHLCV, MFIParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Money Flow Index
 * @param data - OHLCV data array
 * @param params - MFI parameters (period)
 * @returns Array of MFI values (0-100)
 */
export function calculateMFI(data: OHLCV[], params: MFIParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];

  if (data.length < period + 1) {
    return result;
  }

  // Calculate Typical Price and Raw Money Flow
  const typicalPrices: number[] = data.map(d => (d.high + d.low + d.close) / 3);
  const rawMoneyFlow: number[] = typicalPrices.map((tp, i) => tp * data[i].volume);

  // Separate positive and negative money flows
  const positiveMF: number[] = [];
  const negativeMF: number[] = [];

  for (let i = 1; i < data.length; i++) {
    if (typicalPrices[i] > typicalPrices[i - 1]) {
      positiveMF.push(rawMoneyFlow[i]);
      negativeMF.push(0);
    } else if (typicalPrices[i] < typicalPrices[i - 1]) {
      positiveMF.push(0);
      negativeMF.push(rawMoneyFlow[i]);
    } else {
      positiveMF.push(0);
      negativeMF.push(0);
    }
  }

  // Calculate MFI for each period
  for (let i = period - 1; i < positiveMF.length; i++) {
    let sumPositive = 0;
    let sumNegative = 0;

    for (let j = i - period + 1; j <= i; j++) {
      sumPositive += positiveMF[j];
      sumNegative += negativeMF[j];
    }

    const mfRatio = sumNegative === 0 ? 100 : sumPositive / sumNegative;
    const mfi = 100 - 100 / (1 + mfRatio);

    result.push({
      time: data[i + 1].time, // +1 because positiveMF starts from index 1
      value: mfi,
    });
  }

  return result;
}

/**
 * MFI indicator definition with metadata
 */
export const mfiIndicator: IndicatorDefinition<MFIParams, IndicatorValue> = {
  meta: {
    type: 'MFI',
    name: 'Money Flow Index',
    shortName: 'MFI',
    category: 'oscillator',
    defaultParams: { period: 14 },
    defaultColor: '#673AB7',
    description: 'Volume-weighted RSI measuring buying and selling pressure (0-100)',
  },
  calculate: calculateMFI,
};
