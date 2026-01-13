/**
 * Heikin-Ashi calculation utility
 * Transforms standard OHLCV data to Heikin-Ashi candles
 */

import type { OHLCV } from '../types';

export interface HeikinAshiCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Calculate Heikin-Ashi candles from OHLCV data
 * 
 * Heikin-Ashi formulas:
 * - HA Close = (Open + High + Low + Close) / 4
 * - HA Open = (Previous HA Open + Previous HA Close) / 2
 * - HA High = Max(High, HA Open, HA Close)
 * - HA Low = Min(Low, HA Open, HA Close)
 */
export function calculateHeikinAshi(data: OHLCV[]): HeikinAshiCandle[] {
  if (data.length === 0) return [];

  const result: HeikinAshiCandle[] = [];

  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    
    // Calculate HA Close
    const haClose = (current.open + current.high + current.low + current.close) / 4;
    
    // Calculate HA Open
    let haOpen: number;
    if (i === 0) {
      // First candle: HA Open = (Open + Close) / 2
      haOpen = (current.open + current.close) / 2;
    } else {
      // Subsequent candles: HA Open = (Previous HA Open + Previous HA Close) / 2
      const prev = result[i - 1];
      haOpen = (prev.open + prev.close) / 2;
    }
    
    // Calculate HA High and HA Low
    const haHigh = Math.max(current.high, haOpen, haClose);
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
