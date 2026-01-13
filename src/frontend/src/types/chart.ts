/**
 * Chart Types and Configuration
 * Defines chart visualization options and settings
 */

/**
 * Available chart types
 */
export type ChartType =
  | 'candlestick'
  | 'line'
  | 'bar'
  | 'area'
  | 'hollowCandle'
  | 'heikinAshi'
  | 'baseline';

/**
 * Chart type configuration with display info
 */
export interface ChartTypeConfig {
  type: ChartType;
  label: string;
  icon?: string;
  description: string;
}

/**
 * Available time ranges
 */
export type TimeRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

/**
 * Time range configuration
 */
export interface TimeRangeConfig {
  range: TimeRange;
  label: string;
  days: number; // Number of days for the range (-1 for MAX)
}

/**
 * Available data intervals
 */
export type Interval =
  | '1min'
  | '5min'
  | '15min'
  | '30min'
  | '60min'
  | 'daily'
  | 'weekly'
  | 'monthly';

/**
 * Interval configuration with display info
 */
export interface IntervalConfig {
  interval: Interval;
  label: string;
  minutes: number; // -1 for daily+
  isIntraday: boolean;
}

/**
 * Data source options
 */
export type DataSource = 'mock' | 'alphavantage';

/**
 * Chart state shape for context
 */
export interface ChartState {
  symbol: string;
  companyName: string;
  timeRange: TimeRange;
  interval: Interval;
  chartType: ChartType;
  isLoading: boolean;
  error: string | null;
  dataSource: DataSource;
}

/**
 * Chart action types for reducer
 */
export type ChartAction =
  | { type: 'SET_SYMBOL'; payload: { symbol: string; companyName: string } }
  | { type: 'SET_TIME_RANGE'; payload: TimeRange }
  | { type: 'SET_INTERVAL'; payload: Interval }
  | { type: 'SET_CHART_TYPE'; payload: ChartType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DATA_SOURCE'; payload: DataSource };

/**
 * Predefined chart type configurations
 */
export const CHART_TYPES: ChartTypeConfig[] = [
  { type: 'candlestick', label: 'Candlestick', description: 'Traditional candlestick chart' },
  { type: 'line', label: 'Line', description: 'Simple line chart using closing prices' },
  { type: 'bar', label: 'Bar (OHLC)', description: 'Open-High-Low-Close bar chart' },
  { type: 'area', label: 'Area', description: 'Area chart with gradient fill' },
  { type: 'hollowCandle', label: 'Hollow Candlestick', description: 'Hollow body for bullish candles' },
  { type: 'heikinAshi', label: 'Heikin-Ashi', description: 'Smoothed candlestick variation' },
  { type: 'baseline', label: 'Baseline', description: 'Price relative to baseline with two-tone coloring' },
];

/**
 * Predefined time range configurations
 */
export const TIME_RANGES: TimeRangeConfig[] = [
  { range: '1D', label: '1D', days: 1 },
  { range: '5D', label: '5D', days: 5 },
  { range: '1M', label: '1M', days: 30 },
  { range: '6M', label: '6M', days: 180 },
  { range: 'YTD', label: 'YTD', days: -1 }, // Calculated dynamically
  { range: '1Y', label: '1Y', days: 365 },
  { range: '5Y', label: '5Y', days: 1825 },
  { range: 'MAX', label: 'MAX', days: -1 }, // All available data
];

/**
 * Predefined interval configurations
 */
export const INTERVALS: IntervalConfig[] = [
  { interval: '1min', label: '1 Min', minutes: 1, isIntraday: true },
  { interval: '5min', label: '5 Min', minutes: 5, isIntraday: true },
  { interval: '15min', label: '15 Min', minutes: 15, isIntraday: true },
  { interval: '30min', label: '30 Min', minutes: 30, isIntraday: true },
  { interval: '60min', label: '1 Hour', minutes: 60, isIntraday: true },
  { interval: 'daily', label: 'Daily', minutes: -1, isIntraday: false },
  { interval: 'weekly', label: 'Weekly', minutes: -1, isIntraday: false },
  { interval: 'monthly', label: 'Monthly', minutes: -1, isIntraday: false },
];

/**
 * Valid intervals for each time range
 */
export const TIME_RANGE_INTERVALS: Record<TimeRange, Interval[]> = {
  '1D': ['1min', '5min', '15min', '30min', '60min'],
  '5D': ['5min', '15min', '30min', '60min'],
  '1M': ['15min', '30min', '60min', 'daily'],
  '6M': ['daily', 'weekly'],
  'YTD': ['daily', 'weekly'],
  '1Y': ['daily', 'weekly'],
  '5Y': ['daily', 'weekly', 'monthly'],
  'MAX': ['daily', 'weekly', 'monthly'],
};

/**
 * Default interval for each time range
 */
export const DEFAULT_INTERVALS: Record<TimeRange, Interval> = {
  '1D': '5min',
  '5D': '15min',
  '1M': '60min',
  '6M': 'daily',
  'YTD': 'daily',
  '1Y': 'daily',
  '5Y': 'weekly',
  'MAX': 'weekly',
};
