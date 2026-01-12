/**
 * ROC (Rate of Change) Calculation
 * Measures the percentage change in price over a specified period
 * Formula: ROC = ((Close - Close N periods ago) / Close N periods ago) × 100
 */

import type { OHLCV, ROCParams } from '../../../types';
import type { IndicatorValue, IndicatorDefinition } from './types';

/**
 * Calculate Rate of Change
 * @param data - OHLCV data array
 * @param params - ROC parameters (period)
 * @returns Array of ROC values (percentage)
 */
export function calculateROC(data: OHLCV[], params: ROCParams): IndicatorValue[] {
  const { period } = params;
  const result: IndicatorValue[] = [];

  if (data.length <= period) {
    return result;
  }

  for (let i = period; i < data.length; i++) {
    const currentClose = data[i].close;
    const pastClose = data[i - period].close;
    const roc = pastClose === 0 ? 0 : ((currentClose - pastClose) / pastClose) * 100;

    result.push({
      time: data[i].time,
      value: roc,
    });
  }

  return result;
}

/**
 * ROC indicator definition with metadata
 */
export const rocIndicator: IndicatorDefinition<ROCParams, IndicatorValue> = {
  meta: {
    type: 'ROC',
    name: 'Rate of Change',
    shortName: 'ROC',
    category: 'oscillator',
    defaultParams: { period: 12 },
    defaultColor: '#3F51B5',
    description: 'Measures percentage change in price over a period',
  },
  calculate: calculateROC,
};
