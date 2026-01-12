/**
 * Formatting utility functions
 */

import { format } from 'date-fns';

/**
 * Format price with currency symbol
 */
export function formatPrice(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format large numbers (1.2M, 500K, etc.)
 */
export function formatVolume(value: number): string {
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number, includeSign: boolean = true): string {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  if (!includeSign) return formatted;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

/**
 * Format date from timestamp
 */
export function formatDate(timestamp: number, formatString: string = 'MMM d, yyyy'): string {
  // Finnhub uses seconds, JS Date uses milliseconds
  const date = new Date(timestamp * 1000);
  return format(date, formatString);
}

/**
 * Format time from timestamp
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return format(date, 'HH:mm');
}

/**
 * Format date and time from timestamp
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return format(date, 'MMM d, yyyy HH:mm');
}

/**
 * Format market cap
 */
export function formatMarketCap(value: number): string {
  return formatVolume(value * 1e6); // Finnhub returns market cap in millions
}

/**
 * Format number with commas
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format price change with color class
 */
export function formatChange(value: number): { text: string; colorClass: string } {
  const formatted = formatPrice(Math.abs(value));
  const sign = value >= 0 ? '+' : '-';
  return {
    text: `${sign}${formatted}`,
    colorClass: value >= 0 ? 'text-bullish' : 'text-bearish',
  };
}
