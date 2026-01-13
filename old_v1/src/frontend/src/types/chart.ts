/**
 * Chart-related type definitions
 */

// Chart type options
export type ChartType =
  | 'candlestick'
  | 'line'
  | 'bar'
  | 'area'
  | 'hollowCandle'
  | 'heikinAshi'
  | 'baseline';

// Time range presets
export type TimeRange = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

// Data interval/resolution
export type Interval = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';

// Chart theme
export type ChartTheme = 'light' | 'dark';

// Scale type for Y-axis
export type ScaleType = 'linear' | 'logarithmic';

// Chart configuration options
export interface ChartConfig {
  chartType: ChartType;
  timeRange: TimeRange;
  interval: Interval;
  scaleType: ScaleType;
  showVolume: boolean;
  showGrid: boolean;
  showExtendedHours: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

// Chart colors configuration
export interface ChartColors {
  bullish: string;
  bearish: string;
  background: string;
  grid: string;
  text: string;
  crosshair: string;
}

// Crosshair data for legend display
export interface CrosshairData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Chart dimensions
export interface ChartDimensions {
  width: number;
  height: number;
}

// Visible time range
export interface VisibleRange {
  from: number;
  to: number;
}

// Chart state for URL sharing
export interface ChartState {
  symbol: string;
  timeRange: TimeRange;
  interval: Interval;
  chartType: ChartType;
  indicators: string[];
  comparisons: string[];
}
