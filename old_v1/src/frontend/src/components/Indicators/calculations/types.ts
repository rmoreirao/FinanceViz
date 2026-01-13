/**
 * Indicator Calculation Types
 * Provides interfaces and types for technical indicator calculations
 */

import type { OHLCV } from '../../../types';

/**
 * Single-value indicator data point
 */
export interface IndicatorValue {
  time: number;
  value: number;
}

/**
 * Multi-series indicator data point (e.g., Bollinger Bands, MACD)
 */
export interface MultiSeriesValue {
  time: number;
  [key: string]: number;
}

/**
 * Bollinger Bands output
 */
export interface BollingerBandsValue {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

/**
 * Ichimoku Cloud output
 */
export interface IchimokuValue {
  time: number;
  tenkanSen: number;      // Conversion Line
  kijunSen: number;       // Base Line
  senkouSpanA: number;    // Leading Span A
  senkouSpanB: number;    // Leading Span B
  chikouSpan: number;     // Lagging Span
}

/**
 * MACD output
 */
export interface MACDValue {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

/**
 * Stochastic output
 */
export interface StochasticValue {
  time: number;
  k: number;
  d: number;
}

/**
 * ADX output
 */
export interface ADXValue {
  time: number;
  adx: number;
  plusDI: number;
  minusDI: number;
}

/**
 * Aroon output
 */
export interface AroonValue {
  time: number;
  aroonUp: number;
  aroonDown: number;
}

/**
 * Envelope output
 */
export interface EnvelopeValue {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

/**
 * Parabolic SAR output with trend direction
 */
export interface ParabolicSARValue {
  time: number;
  value: number;
  trend: 'up' | 'down';
}

/**
 * Generic indicator calculation function type
 * @param data - OHLCV data array
 * @param params - Indicator-specific parameters
 * @returns Array of indicator values
 */
export type IndicatorCalculationFn<TParams, TOutput> = (
  data: OHLCV[],
  params: TParams
) => TOutput[];

/**
 * Indicator metadata for registration and UI
 */
export interface IndicatorMeta<TParams> {
  type: string;
  name: string;
  shortName: string;
  category: 'overlay' | 'oscillator' | 'volume';
  defaultParams: TParams;
  defaultColor: string;
  description: string;
  outputs?: string[]; // For multi-line indicators
}

/**
 * Complete indicator definition with calculation function
 */
export interface IndicatorDefinition<TParams, TOutput> {
  meta: IndicatorMeta<TParams>;
  calculate: IndicatorCalculationFn<TParams, TOutput>;
}
