/**
 * Envelope Indicator Calculation
 * Upper = SMA × (1 + percentage/100)
 * Lower = SMA × (1 - percentage/100)
 */

import type { OHLCV, EnvelopeParams } from '../../../types';
import type { EnvelopeValue, IndicatorDefinition } from './types';

/**
 * Calculate Envelope bands
 * @param data - OHLCV data array
 * @param params - Envelope parameters (period, percentage)
 * @returns Array of Envelope values (upper, middle, lower)
 */
export function calculateEnvelope(
  data: OHLCV[],
  params: EnvelopeParams
): EnvelopeValue[] {
  const { period, percentage } = params;
  const result: EnvelopeValue[] = [];
  
  if (data.length < period) {
    return result;
  }
  
  const multiplier = percentage / 100;
  
  // Calculate Envelope for each valid point
  for (let i = period - 1; i < data.length; i++) {
    // Calculate SMA
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    const sma = sum / period;
    
    result.push({
      time: data[i].time,
      upper: sma * (1 + multiplier),
      middle: sma,
      lower: sma * (1 - multiplier),
    });
  }
  
  return result;
}

/**
 * Envelope indicator definition with metadata
 */
export const envelopeIndicator: IndicatorDefinition<EnvelopeParams, EnvelopeValue> = {
  meta: {
    type: 'ENVELOPE',
    name: 'Envelope',
    shortName: 'ENV',
    category: 'overlay',
    defaultParams: { period: 20, percentage: 2.5 },
    defaultColor: '#795548',
    description: 'Moving average with percentage-based bands above and below',
    outputs: ['upper', 'middle', 'lower'],
  },
  calculate: calculateEnvelope,
};
