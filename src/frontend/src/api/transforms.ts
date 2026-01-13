/**
 * Data transformation utilities for API responses
 */

import type { OHLCV, AlphaVantageOHLCV } from '../types';

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

/**
 * Transform Alpha Vantage time series response to OHLCV array
 * Handles the date-keyed object format from Alpha Vantage
 */
export function transformAlphaVantageTimeSeries(
  timeSeries: Record<string, AlphaVantageOHLCV>,
  resolution: string
): OHLCV[] {
  if (!timeSeries || typeof timeSeries !== 'object') {
    return [];
  }

  const data: OHLCV[] = [];
  const isIntraday = ['1', '5', '15', '30', '60'].includes(resolution);

  for (const [dateStr, ohlcv] of Object.entries(timeSeries)) {
    // Skip if missing required fields
    if (!ohlcv['1. open'] || !ohlcv['4. close']) {
      continue;
    }

    // Parse date string to UNIX timestamp
    let timestamp: number;
    if (isIntraday) {
      // Intraday format: "2026-01-13 16:00:00"
      timestamp = Math.floor(new Date(dateStr).getTime() / 1000);
    } else {
      // Daily/Weekly/Monthly format: "2026-01-13"
      // Parse as local date to avoid timezone issues
      const [year, month, day] = dateStr.split('-').map(Number);
      timestamp = Math.floor(new Date(year, month - 1, day).getTime() / 1000);
    }

    // Skip invalid timestamps
    if (isNaN(timestamp)) {
      continue;
    }

    data.push({
      time: timestamp,
      open: parseFloat(ohlcv['1. open']) || 0,
      high: parseFloat(ohlcv['2. high']) || 0,
      low: parseFloat(ohlcv['3. low']) || 0,
      close: parseFloat(ohlcv['4. close']) || 0,
      volume: parseFloat(ohlcv['5. volume']) || 0,
    });
  }

  // Sort by time ascending (Alpha Vantage returns newest first)
  data.sort((a, b) => a.time - b.time);

  return data;
}
