/**
 * On-Balance Volume (OBV) Indicator Calculation
 * 
 * Formula:
 *   If close > prev close: OBV = prevOBV + volume
 *   If close < prev close: OBV = prevOBV - volume
 *   If close = prev close: OBV = prevOBV
 * 
 * OBV is a cumulative indicator that adds volume on up days and 
 * subtracts volume on down days to measure buying and selling pressure.
 *
 * TASK-051: OBV Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput } from './types';

/**
 * Calculate On-Balance Volume
 * 
 * @param data - OHLCV data array
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const obv = calculateOBV(data);
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateOBV = (data: IndicatorInput): IndicatorOutput => {
  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  const result: IndicatorOutput = [];
  let obv = 0;

  // First bar: OBV starts at 0 (or could start with first volume)
  result.push({
    time: data[0].time,
    value: obv,
  });

  // Calculate OBV for subsequent bars
  for (let i = 1; i < data.length; i++) {
    const currentClose = data[i].close;
    const prevClose = data[i - 1].close;
    const volume = data[i].volume;

    if (currentClose > prevClose) {
      obv += volume;
    } else if (currentClose < prevClose) {
      obv -= volume;
    }
    // If close == prevClose, OBV stays the same

    result.push({
      time: data[i].time,
      value: obv,
    });
  }

  return result;
};

/**
 * Calculate OBV from arrays (utility function)
 * 
 * @param closes - Array of close prices
 * @param volumes - Array of volumes
 * @returns Array of OBV values
 */
export const calculateOBVFromValues = (
  closes: number[],
  volumes: number[]
): number[] => {
  if (!closes || !volumes || closes.length === 0) {
    return [];
  }

  if (closes.length !== volumes.length) {
    console.warn('OBV: closes and volumes must have same length');
    return [];
  }

  const result: number[] = [];
  let obv = 0;

  // First bar
  result.push(obv);

  // Subsequent bars
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv += volumes[i];
    } else if (closes[i] < closes[i - 1]) {
      obv -= volumes[i];
    }
    result.push(obv);
  }

  return result;
};

/**
 * Get OBV signal based on trend
 * 
 * @param currentOBV - Current OBV value
 * @param prevOBV - Previous OBV value
 * @returns 'bullish', 'bearish', or 'neutral'
 */
export const getOBVSignal = (
  currentOBV: number,
  prevOBV: number
): 'bullish' | 'bearish' | 'neutral' => {
  const change = currentOBV - prevOBV;
  
  if (change > 0) {
    return 'bullish';
  } else if (change < 0) {
    return 'bearish';
  }
  return 'neutral';
};

/**
 * Calculate OBV with signal line (SMA of OBV)
 * 
 * @param data - OHLCV data array
 * @param signalPeriod - Period for signal line SMA
 * @returns Object with obv and signal arrays
 */
export const calculateOBVWithSignal = (
  data: IndicatorInput,
  signalPeriod: number = 20
): { obv: IndicatorOutput; signal: IndicatorOutput } => {
  const obvOutput = calculateOBV(data);
  
  if (obvOutput.length < signalPeriod) {
    return { obv: obvOutput, signal: [] };
  }

  const signalOutput: IndicatorOutput = [];

  for (let i = signalPeriod - 1; i < obvOutput.length; i++) {
    let sum = 0;
    for (let j = i - signalPeriod + 1; j <= i; j++) {
      sum += obvOutput[j].value;
    }
    signalOutput.push({
      time: obvOutput[i].time,
      value: sum / signalPeriod,
    });
  }

  return { obv: obvOutput, signal: signalOutput };
};
