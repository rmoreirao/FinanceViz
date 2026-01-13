/**
 * Envelope Indicator Calculation (Moving Average Envelope)
 * 
 * Components:
 *   - Upper: SMA * (1 + percentage)
 *   - Lower: SMA * (1 - percentage)
 * 
 * Envelopes are percentage-based bands set above and below a moving average.
 *
 * TASK-038: Envelope Indicator Calculation
 */

import type { IndicatorInput, EnvelopeCalculationParams, EnvelopeOutput, PriceSource } from './types';
import { extractPrices, extractTimes } from './types';
import { calculateSMAFromValues } from './sma';

/**
 * Default Envelope parameters
 */
export const DEFAULT_ENVELOPE_PARAMS: EnvelopeCalculationParams = {
  period: 20,
  percentage: 2.5, // 2.5% envelope
};

/**
 * Calculate Moving Average Envelope
 * 
 * @param data - OHLCV data array
 * @param params - Envelope parameters (period, percentage)
 * @returns Object containing upper, middle, and lower bands
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const envelope = calculateEnvelope(data, { period: 20, percentage: 2.5 });
 * // Returns: { upper: [...], middle: [...], lower: [...] }
 */
export const calculateEnvelope = (
  data: IndicatorInput,
  params: Partial<EnvelopeCalculationParams> = {}
): EnvelopeOutput => {
  const { period, percentage } = { ...DEFAULT_ENVELOPE_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return { upper: [], middle: [], lower: [] };
  }

  if (period <= 0) {
    console.warn('Envelope period must be positive');
    return { upper: [], middle: [], lower: [] };
  }

  if (percentage < 0) {
    console.warn('Envelope percentage must be non-negative');
    return { upper: [], middle: [], lower: [] };
  }

  if (data.length < period) {
    // Not enough data to calculate envelope
    return { upper: [], middle: [], lower: [] };
  }

  const prices = extractPrices(data, 'close' as PriceSource);
  const times = extractTimes(data);

  // Calculate SMA
  const smaValues = calculateSMAFromValues(prices, period);
  
  // Convert percentage to multiplier
  const percentageMultiplier = percentage / 100;
  
  const upper = [];
  const middle = [];
  const lower = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (!isNaN(smaValues[i])) {
      const sma = smaValues[i];
      
      upper.push({
        time: times[i],
        value: sma * (1 + percentageMultiplier),
      });
      
      middle.push({
        time: times[i],
        value: sma,
      });
      
      lower.push({
        time: times[i],
        value: sma * (1 - percentageMultiplier),
      });
    }
  }

  return { upper, middle, lower };
};

/**
 * Calculate Envelope from an array of numbers (utility function)
 * 
 * @param values - Array of numeric values
 * @param period - SMA period for the middle band
 * @param percentage - Percentage for upper/lower bands
 * @returns Object with upper, middle, lower arrays (same length as input with NaN for insufficient data)
 */
export const calculateEnvelopeFromValues = (
  values: number[],
  period: number,
  percentage: number
): { upper: number[]; middle: number[]; lower: number[] } => {
  if (!values || values.length === 0 || period <= 0) {
    return { upper: [], middle: [], lower: [] };
  }

  const smaValues = calculateSMAFromValues(values, period);
  const percentageMultiplier = percentage / 100;
  
  const upper: number[] = [];
  const middle: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (isNaN(smaValues[i])) {
      upper.push(NaN);
      middle.push(NaN);
      lower.push(NaN);
    } else {
      const sma = smaValues[i];
      upper.push(sma * (1 + percentageMultiplier));
      middle.push(sma);
      lower.push(sma * (1 - percentageMultiplier));
    }
  }

  return { upper, middle, lower };
};
