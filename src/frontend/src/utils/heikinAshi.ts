/**
 * Heikin-Ashi Calculation Utility
 * 
 * TASK-022: Heikin-Ashi Chart Type
 * 
 * Heikin-Ashi (Japanese for "average bar") is a candlestick charting technique
 * that filters out market noise and provides a clearer picture of trends.
 * 
 * Formulas:
 * - HA Close = (Open + High + Low + Close) / 4
 * - HA Open = (prev HA Open + prev HA Close) / 2
 * - HA High = max(High, HA Open, HA Close)
 * - HA Low = min(Low, HA Open, HA Close)
 */

import type { OHLCV } from '../types';

/**
 * Heikin-Ashi OHLCV data point
 */
export interface HeikinAshiOHLCV extends OHLCV {
  // Original values preserved for reference
  originalOpen: number;
  originalHigh: number;
  originalLow: number;
  originalClose: number;
}

/**
 * Calculate Heikin-Ashi values from OHLCV data
 * 
 * @param data - Array of OHLCV data points
 * @returns Array of Heikin-Ashi calculated data points
 */
export function calculateHeikinAshi(data: OHLCV[]): HeikinAshiOHLCV[] {
  if (data.length === 0) return [];

  const result: HeikinAshiOHLCV[] = [];

  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    
    // HA Close = (O + H + L + C) / 4
    const haClose = (current.open + current.high + current.low + current.close) / 4;
    
    let haOpen: number;
    if (i === 0) {
      // First bar: HA Open = (Open + Close) / 2
      haOpen = (current.open + current.close) / 2;
    } else {
      // Subsequent bars: HA Open = (prev HA Open + prev HA Close) / 2
      const prevHA = result[i - 1];
      haOpen = (prevHA.open + prevHA.close) / 2;
    }
    
    // HA High = max(H, HA Open, HA Close)
    const haHigh = Math.max(current.high, haOpen, haClose);
    
    // HA Low = min(L, HA Open, HA Close)
    const haLow = Math.min(current.low, haOpen, haClose);
    
    result.push({
      time: current.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: current.volume,
      originalOpen: current.open,
      originalHigh: current.high,
      originalLow: current.low,
      originalClose: current.close,
    });
  }

  return result;
}

/**
 * Convert OHLCV data to Heikin-Ashi format (simple version without original values)
 * 
 * @param data - Array of OHLCV data points
 * @returns Array of Heikin-Ashi OHLCV data points
 */
export function toHeikinAshi(data: OHLCV[]): OHLCV[] {
  if (data.length === 0) return [];

  const result: OHLCV[] = [];

  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    
    // HA Close = (O + H + L + C) / 4
    const haClose = (current.open + current.high + current.low + current.close) / 4;
    
    let haOpen: number;
    if (i === 0) {
      // First bar: HA Open = (Open + Close) / 2
      haOpen = (current.open + current.close) / 2;
    } else {
      // Subsequent bars: HA Open = (prev HA Open + prev HA Close) / 2
      const prevHA = result[i - 1];
      haOpen = (prevHA.open + prevHA.close) / 2;
    }
    
    // HA High = max(H, HA Open, HA Close)
    const haHigh = Math.max(current.high, haOpen, haClose);
    
    // HA Low = min(L, HA Open, HA Close)
    const haLow = Math.min(current.low, haOpen, haClose);
    
    result.push({
      time: current.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: current.volume,
    });
  }

  return result;
}

export default calculateHeikinAshi;
