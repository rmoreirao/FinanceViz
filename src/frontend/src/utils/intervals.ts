/**
 * Interval and time range utilities
 */

import type { TimeRange, Interval } from '../types';
import { INTERVALS } from './constants';

/**
 * Get valid intervals for a given time range
 * Intraday intervals only available for short time ranges
 */
export function getValidIntervals(timeRange: TimeRange): Interval[] {
  const allowIntraday = ['1D', '5D', '1M'].includes(timeRange);
  
  return INTERVALS
    .filter((interval) => allowIntraday || !interval.intraday)
    .map((interval) => interval.value);
}

/**
 * Get default interval for a time range
 */
export function getDefaultInterval(timeRange: TimeRange): Interval {
  switch (timeRange) {
    case '1D':
      return '5';
    case '5D':
      return '15';
    case '1M':
      return '60';
    case '6M':
    case 'YTD':
    case '1Y':
      return 'D';
    case '5Y':
    case 'MAX':
      return 'W';
    default:
      return 'D';
  }
}

/**
 * Get from/to timestamps for a time range
 */
export function getTimeRangeBounds(timeRange: TimeRange): { from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  const today = new Date();
  
  let from: number;
  
  switch (timeRange) {
    case '1D':
      // Start of today
      from = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 1000);
      break;
    case '5D':
      from = now - 5 * 24 * 60 * 60;
      break;
    case '1M':
      from = now - 30 * 24 * 60 * 60;
      break;
    case '6M':
      from = now - 180 * 24 * 60 * 60;
      break;
    case 'YTD':
      from = Math.floor(new Date(today.getFullYear(), 0, 1).getTime() / 1000);
      break;
    case '1Y':
      from = now - 365 * 24 * 60 * 60;
      break;
    case '5Y':
      from = now - 5 * 365 * 24 * 60 * 60;
      break;
    case 'MAX':
      from = 0; // Earliest available data
      break;
    default:
      from = now - 365 * 24 * 60 * 60;
  }
  
  return { from, to: now };
}

/**
 * Convert interval to Finnhub resolution format
 */
export function getResolutionFromInterval(interval: Interval): string {
  // Finnhub uses the same format for most intervals
  return interval;
}

/**
 * Check if interval is valid for time range
 */
export function isValidInterval(interval: Interval, timeRange: TimeRange): boolean {
  const validIntervals = getValidIntervals(timeRange);
  return validIntervals.includes(interval);
}

/**
 * Get interval in milliseconds (for calculations)
 */
export function getIntervalMs(interval: Interval): number {
  switch (interval) {
    case '1':
      return 60 * 1000;
    case '5':
      return 5 * 60 * 1000;
    case '15':
      return 15 * 60 * 1000;
    case '30':
      return 30 * 60 * 1000;
    case '60':
      return 60 * 60 * 1000;
    case 'D':
      return 24 * 60 * 60 * 1000;
    case 'W':
      return 7 * 24 * 60 * 60 * 1000;
    case 'M':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}
