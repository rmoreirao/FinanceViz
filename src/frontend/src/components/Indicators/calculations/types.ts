/**
 * Indicator Calculation Types
 * Defines types for indicator calculations
 *
 * TASK-030: Indicator Calculation Types
 */

import type { OHLCV } from '../../../types/stock';

/**
 * Indicator input type - array of OHLCV data
 */
export type IndicatorInput = OHLCV[];

/**
 * Single indicator output point
 */
export interface IndicatorPoint {
  time: number;
  value: number;
}

/**
 * Indicator output type - array of time/value pairs
 */
export type IndicatorOutput = IndicatorPoint[];

/**
 * Base indicator parameters
 */
export interface BaseIndicatorParams {
  period?: number;
}

/**
 * Moving Average parameters (SMA, EMA, WMA, DEMA, TEMA)
 */
export interface MAParams extends BaseIndicatorParams {
  period: number;
  source?: 'open' | 'high' | 'low' | 'close' | 'hl2' | 'hlc3' | 'ohlc4';
}

/**
 * Bollinger Bands parameters
 */
export interface BollingerParams extends BaseIndicatorParams {
  period: number;
  stdDevMultiplier: number;
  source?: 'open' | 'high' | 'low' | 'close';
}

/**
 * Bollinger Bands output (three lines)
 */
export interface BollingerBandsOutput {
  upper: IndicatorOutput;
  middle: IndicatorOutput;
  lower: IndicatorOutput;
}

/**
 * RSI parameters
 */
export interface RSICalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * MACD parameters
 */
export interface MACDCalculationParams {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
}

/**
 * MACD output (three components)
 */
export interface MACDOutput {
  macdLine: IndicatorOutput;
  signalLine: IndicatorOutput;
  histogram: IndicatorOutput;
}

/**
 * Stochastic parameters
 */
export interface StochasticCalculationParams {
  kPeriod: number;
  dPeriod: number;
  smooth: number;
}

/**
 * Stochastic output
 */
export interface StochasticOutput {
  k: IndicatorOutput;
  d: IndicatorOutput;
}

/**
 * ATR parameters
 */
export interface ATRCalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * ADX parameters
 */
export interface ADXCalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * ADX output (three lines)
 */
export interface ADXOutput {
  adx: IndicatorOutput;
  plusDI: IndicatorOutput;
  minusDI: IndicatorOutput;
}

/**
 * CCI parameters
 */
export interface CCICalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * Williams %R parameters
 */
export interface WilliamsRCalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * Envelope parameters
 */
export interface EnvelopeCalculationParams extends BaseIndicatorParams {
  period: number;
  percentage: number;
}

/**
 * Envelope output
 */
export interface EnvelopeOutput {
  upper: IndicatorOutput;
  middle: IndicatorOutput;
  lower: IndicatorOutput;
}

/**
 * Parabolic SAR parameters
 */
export interface ParabolicSARCalculationParams {
  step: number;
  max: number;
}

/**
 * Ichimoku parameters
 */
export interface IchimokuCalculationParams {
  tenkanPeriod: number;
  kijunPeriod: number;
  senkouPeriod: number;
}

/**
 * Ichimoku output (five lines)
 */
export interface IchimokuOutput {
  tenkanSen: IndicatorOutput;
  kijunSen: IndicatorOutput;
  senkouSpanA: IndicatorOutput;
  senkouSpanB: IndicatorOutput;
  chikouSpan: IndicatorOutput;
}

/**
 * ROC parameters
 */
export interface ROCCalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * Momentum parameters
 */
export interface MomentumCalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * OBV has no parameters
 */
export type OBVCalculationParams = Record<string, never>;

/**
 * CMF parameters
 */
export interface CMFCalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * MFI parameters
 */
export interface MFICalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * Aroon parameters
 */
export interface AroonCalculationParams extends BaseIndicatorParams {
  period: number;
}

/**
 * Aroon output
 */
export interface AroonOutput {
  aroonUp: IndicatorOutput;
  aroonDown: IndicatorOutput;
}

/**
 * Awesome Oscillator parameters
 */
export interface AwesomeOscillatorCalculationParams {
  fastPeriod: number;
  slowPeriod: number;
}

/**
 * Price source extractor function type
 */
export type PriceSource = 'open' | 'high' | 'low' | 'close' | 'hl2' | 'hlc3' | 'ohlc4';

/**
 * Get price value from OHLCV based on source
 */
export const getPriceValue = (candle: OHLCV, source: PriceSource): number => {
  switch (source) {
    case 'open':
      return candle.open;
    case 'high':
      return candle.high;
    case 'low':
      return candle.low;
    case 'close':
      return candle.close;
    case 'hl2':
      return (candle.high + candle.low) / 2;
    case 'hlc3':
      return (candle.high + candle.low + candle.close) / 3;
    case 'ohlc4':
      return (candle.open + candle.high + candle.low + candle.close) / 4;
    default:
      return candle.close;
  }
};

/**
 * Extract prices array from OHLCV data based on source
 */
export const extractPrices = (data: IndicatorInput, source: PriceSource = 'close'): number[] => {
  return data.map(candle => getPriceValue(candle, source));
};

/**
 * Extract times array from OHLCV data
 */
export const extractTimes = (data: IndicatorInput): number[] => {
  return data.map(candle => candle.time);
};
