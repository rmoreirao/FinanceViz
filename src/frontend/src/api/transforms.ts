/**
 * Data transformation utilities for API responses
 */

import type { FinnhubCandleResponse, OHLCV } from '../types';

/**
 * Transform Finnhub candle response to OHLCV array
 */
export function transformCandleResponse(response: FinnhubCandleResponse): OHLCV[] {
  if (response.s === 'no_data' || !response.t) {
    return [];
  }

  const { c, h, l, o, t, v } = response;
  const data: OHLCV[] = [];

  for (let i = 0; i < t.length; i++) {
    data.push({
      time: t[i],
      open: o[i],
      high: h[i],
      low: l[i],
      close: c[i],
      volume: v[i],
    });
  }

  return data;
}

/**
 * Aggregate OHLCV data to a larger interval
 * e.g., aggregate 1-minute data to 5-minute bars
 */
export function aggregateToInterval(data: OHLCV[], intervalMinutes: number): OHLCV[] {
  if (data.length === 0 || intervalMinutes <= 1) {
    return data;
  }

  const intervalSeconds = intervalMinutes * 60;
  const aggregated: OHLCV[] = [];
  let currentBar: OHLCV | null = null;

  for (const candle of data) {
    const barTime = Math.floor(candle.time / intervalSeconds) * intervalSeconds;

    if (!currentBar || currentBar.time !== barTime) {
      if (currentBar) {
        aggregated.push(currentBar);
      }
      currentBar = {
        time: barTime,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      };
    } else {
      currentBar.high = Math.max(currentBar.high, candle.high);
      currentBar.low = Math.min(currentBar.low, candle.low);
      currentBar.close = candle.close;
      currentBar.volume += candle.volume;
    }
  }

  if (currentBar) {
    aggregated.push(currentBar);
  }

  return aggregated;
}

/**
 * Calculate Heikin-Ashi candles from OHLCV data
 */
export function calculateHeikinAshi(data: OHLCV[]): OHLCV[] {
  if (data.length === 0) {
    return [];
  }

  const heikinAshi: OHLCV[] = [];
  let prevHA: OHLCV | null = null;

  for (const candle of data) {
    const haClose = (candle.open + candle.high + candle.low + candle.close) / 4;
    const haOpen = prevHA
      ? (prevHA.open + prevHA.close) / 2
      : (candle.open + candle.close) / 2;
    const haHigh = Math.max(candle.high, haOpen, haClose);
    const haLow = Math.min(candle.low, haOpen, haClose);

    const haCandle: OHLCV = {
      time: candle.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: candle.volume,
    };

    heikinAshi.push(haCandle);
    prevHA = haCandle;
  }

  return heikinAshi;
}
