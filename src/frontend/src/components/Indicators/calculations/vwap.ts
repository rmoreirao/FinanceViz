/**
 * Volume Weighted Average Price (VWAP) Indicator Calculation
 * 
 * Formula: VWAP = sum(typical price * volume) / sum(volume)
 * Typical Price: (High + Low + Close) / 3
 * 
 * VWAP resets at session start and provides a benchmark for 
 * trade execution quality.
 *
 * TASK-037: VWAP Indicator Calculation
 */

import type { IndicatorInput, IndicatorOutput } from './types';

/**
 * Default VWAP parameters
 */
export interface VWAPParams {
  /**
   * If true, VWAP resets at each new day (session)
   * If false, VWAP is calculated continuously
   */
  resetOnSession?: boolean;
}

export const DEFAULT_VWAP_PARAMS: VWAPParams = {
  resetOnSession: true,
};

/**
 * Calculate the typical price for a candle
 * Typical Price = (High + Low + Close) / 3
 */
const getTypicalPrice = (high: number, low: number, close: number): number => {
  return (high + low + close) / 3;
};

/**
 * Check if two timestamps are on different days
 * Used for session reset detection
 */
const isDifferentDay = (timestamp1: number, timestamp2: number): boolean => {
  const date1 = new Date(timestamp1 * 1000);
  const date2 = new Date(timestamp2 * 1000);
  return (
    date1.getUTCFullYear() !== date2.getUTCFullYear() ||
    date1.getUTCMonth() !== date2.getUTCMonth() ||
    date1.getUTCDate() !== date2.getUTCDate()
  );
};

/**
 * Calculate Volume Weighted Average Price
 * 
 * @param data - OHLCV data array
 * @param params - VWAP parameters
 * @returns Array of {time, value} pairs
 * 
 * @example
 * const data = [{time: 1, open: 10, high: 12, low: 9, close: 11, volume: 100}, ...]
 * const vwap = calculateVWAP(data, { resetOnSession: true });
 * // Returns: [{time: ..., value: ...}, ...]
 */
export const calculateVWAP = (
  data: IndicatorInput,
  params: Partial<VWAPParams> = {}
): IndicatorOutput => {
  const { resetOnSession } = { ...DEFAULT_VWAP_PARAMS, ...params };

  // Handle edge cases
  if (!data || data.length === 0) {
    return [];
  }

  const result: IndicatorOutput = [];
  let cumulativeTPV = 0; // Cumulative Typical Price * Volume
  let cumulativeVolume = 0;
  let prevTime = data[0].time;

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    
    // Check for session reset (new day)
    if (resetOnSession && i > 0 && isDifferentDay(prevTime, candle.time)) {
      cumulativeTPV = 0;
      cumulativeVolume = 0;
    }
    
    const typicalPrice = getTypicalPrice(candle.high, candle.low, candle.close);
    const tpv = typicalPrice * candle.volume;
    
    cumulativeTPV += tpv;
    cumulativeVolume += candle.volume;
    
    // Avoid division by zero
    const vwap = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;
    
    result.push({
      time: candle.time,
      value: vwap,
    });
    
    prevTime = candle.time;
  }

  return result;
};

/**
 * Calculate VWAP with bands (optional upper/lower bands based on standard deviation)
 * 
 * @param data - OHLCV data array
 * @param params - VWAP parameters with band multiplier
 * @returns Object containing vwap, upperBand, and lowerBand
 */
export interface VWAPWithBandsParams extends VWAPParams {
  bandMultiplier?: number;
}

export interface VWAPWithBandsOutput {
  vwap: IndicatorOutput;
  upperBand: IndicatorOutput;
  lowerBand: IndicatorOutput;
}

export const calculateVWAPWithBands = (
  data: IndicatorInput,
  params: VWAPWithBandsParams = {}
): VWAPWithBandsOutput => {
  const { resetOnSession = true, bandMultiplier = 2 } = params;

  // Handle edge cases
  if (!data || data.length === 0) {
    return { vwap: [], upperBand: [], lowerBand: [] };
  }

  const vwap: IndicatorOutput = [];
  const upperBand: IndicatorOutput = [];
  const lowerBand: IndicatorOutput = [];
  
  let cumulativeTPV = 0;
  let cumulativeVolume = 0;
  let cumulativeTPVSquared = 0;
  let prevTime = data[0].time;

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    
    // Check for session reset (new day)
    if (resetOnSession && i > 0 && isDifferentDay(prevTime, candle.time)) {
      cumulativeTPV = 0;
      cumulativeVolume = 0;
      cumulativeTPVSquared = 0;
    }
    
    const typicalPrice = getTypicalPrice(candle.high, candle.low, candle.close);
    const tpv = typicalPrice * candle.volume;
    
    cumulativeTPV += tpv;
    cumulativeVolume += candle.volume;
    cumulativeTPVSquared += typicalPrice * typicalPrice * candle.volume;
    
    // Calculate VWAP
    const vwapValue = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;
    
    // Calculate standard deviation for bands
    let stdDev = 0;
    if (cumulativeVolume > 0) {
      const variance = (cumulativeTPVSquared / cumulativeVolume) - (vwapValue * vwapValue);
      stdDev = variance > 0 ? Math.sqrt(variance) : 0;
    }
    
    vwap.push({
      time: candle.time,
      value: vwapValue,
    });
    
    upperBand.push({
      time: candle.time,
      value: vwapValue + bandMultiplier * stdDev,
    });
    
    lowerBand.push({
      time: candle.time,
      value: vwapValue - bandMultiplier * stdDev,
    });
    
    prevTime = candle.time;
  }

  return { vwap, upperBand, lowerBand };
};
