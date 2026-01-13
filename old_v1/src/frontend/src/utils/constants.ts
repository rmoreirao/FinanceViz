/**
 * Application constants
 */

import type { TimeRange, Interval, ChartType } from '../types';

// Time range options
export const TIME_RANGES: Array<{ label: string; value: TimeRange }> = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '1M' },
  { label: '6M', value: '6M' },
  { label: 'YTD', value: 'YTD' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
  { label: 'MAX', value: 'MAX' },
];

// Interval options
export const INTERVALS: Array<{ label: string; value: Interval; intraday: boolean }> = [
  { label: '1 min', value: '1', intraday: true },
  { label: '5 min', value: '5', intraday: true },
  { label: '15 min', value: '15', intraday: true },
  { label: '30 min', value: '30', intraday: true },
  { label: '1 hour', value: '60', intraday: true },
  { label: 'Daily', value: 'D', intraday: false },
  { label: 'Weekly', value: 'W', intraday: false },
  { label: 'Monthly', value: 'M', intraday: false },
];

// Chart type options
export const CHART_TYPES: Array<{ label: string; value: ChartType; icon?: string }> = [
  { label: 'Candlestick', value: 'candlestick' },
  { label: 'Line', value: 'line' },
  { label: 'Bar (OHLC)', value: 'bar' },
  { label: 'Area', value: 'area' },
  { label: 'Hollow Candle', value: 'hollowCandle' },
  { label: 'Heikin-Ashi', value: 'heikinAshi' },
  { label: 'Baseline', value: 'baseline' },
];

// Color palette for comparison symbols
export const COMPARISON_COLORS: string[] = [
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

// Chart colors
export const CHART_COLORS = {
  light: {
    bullish: '#22c55e',
    bearish: '#ef4444',
    background: '#ffffff',
    grid: '#e5e7eb',
    text: '#374151',
    crosshair: '#9ca3af',
  },
  dark: {
    bullish: '#22c55e',
    bearish: '#ef4444',
    background: '#1a1a2e',
    grid: '#374151',
    text: '#e5e7eb',
    crosshair: '#6b7280',
  },
};

// Popular indices for quick comparison
export const POPULAR_INDICES = [
  { label: 'S&P 500', symbol: '^GSPC' },
  { label: 'NASDAQ', symbol: '^IXIC' },
  { label: 'DOW', symbol: '^DJI' },
];

// Default chart settings
export const DEFAULT_CHART_CONFIG = {
  chartType: 'candlestick' as ChartType,
  timeRange: '1Y' as TimeRange,
  interval: 'D' as Interval,
  scaleType: 'linear' as const,
  showVolume: true,
  showGrid: true,
  showExtendedHours: false,
  autoRefresh: true,
  refreshInterval: 15,
};

// Indicator default heights (in pixels)
export const INDICATOR_PANEL_HEIGHT = {
  default: 150,
  min: 80,
  max: 300,
};
