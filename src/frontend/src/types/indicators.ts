/**
 * Technical indicator type definitions
 */

import type { OHLCV } from './stock';

// Indicator category
export type IndicatorCategory = 'overlay' | 'oscillator' | 'volume';

// Base indicator types
export type OverlayIndicatorType =
  | 'SMA'
  | 'EMA'
  | 'WMA'
  | 'DEMA'
  | 'TEMA'
  | 'BB'       // Bollinger Bands
  | 'VWAP'
  | 'ENVELOPE'
  | 'SAR'      // Parabolic SAR
  | 'ICHIMOKU';

export type OscillatorIndicatorType =
  | 'RSI'
  | 'MACD'
  | 'STOCH'    // Stochastic
  | 'STOCHRSI'
  | 'WILLR'    // Williams %R
  | 'CCI'
  | 'ATR'
  | 'ADX'
  | 'ROC'
  | 'MOM'      // Momentum
  | 'OBV'
  | 'CMF'
  | 'MFI'
  | 'AROON'
  | 'AO';      // Awesome Oscillator

export type IndicatorType = OverlayIndicatorType | OscillatorIndicatorType;

// Indicator data point (single value)
export interface IndicatorDataPoint {
  time: number;
  value: number;
}

// Multi-line indicator data point
export interface MultiLineDataPoint {
  time: number;
  [key: string]: number;
}

// Indicator output types
export type IndicatorOutput = IndicatorDataPoint[] | MultiLineDataPoint[];

// Base indicator configuration
export interface BaseIndicatorConfig {
  id: string;
  type: IndicatorType;
  category: IndicatorCategory;
  visible: boolean;
  color: string;
}

// Overlay indicator with specific params
export interface OverlayIndicator extends BaseIndicatorConfig {
  category: 'overlay';
  type: OverlayIndicatorType;
  params: IndicatorParams;
}

// Oscillator indicator with panel height
export interface OscillatorIndicator extends BaseIndicatorConfig {
  category: 'oscillator';
  type: OscillatorIndicatorType;
  params: IndicatorParams;
  height: number; // Panel height in pixels
}

// Union type for all indicators
export type Indicator = OverlayIndicator | OscillatorIndicator;

// Parameter types for different indicators
export interface SMAParams {
  period: number;
}

export interface EMAParams {
  period: number;
}

export interface WMAParams {
  period: number;
}

export interface DEMAParams {
  period: number;
}

export interface TEMAParams {
  period: number;
}

export interface BollingerBandsParams {
  period: number;
  stdDev: number;
}

export interface EnvelopeParams {
  period: number;
  percentage: number;
}

export interface ParabolicSARParams {
  step: number;
  max: number;
}

export interface IchimokuParams {
  tenkan: number;
  kijun: number;
  senkou: number;
}

export interface RSIParams {
  period: number;
}

export interface MACDParams {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
}

export interface StochasticParams {
  kPeriod: number;
  dPeriod: number;
  smooth: number;
}

export interface StochasticRSIParams {
  rsiPeriod: number;
  stochPeriod: number;
}

export interface WilliamsRParams {
  period: number;
}

export interface CCIParams {
  period: number;
}

export interface ATRParams {
  period: number;
}

export interface ADXParams {
  period: number;
}

export interface ROCParams {
  period: number;
}

export interface MomentumParams {
  period: number;
}

export interface CMFParams {
  period: number;
}

export interface MFIParams {
  period: number;
}

export interface AroonParams {
  period: number;
}

export interface AwesomeOscillatorParams {
  fastPeriod: number;
  slowPeriod: number;
}

// Union of all parameter types
export type IndicatorParams =
  | SMAParams
  | EMAParams
  | WMAParams
  | DEMAParams
  | TEMAParams
  | BollingerBandsParams
  | EnvelopeParams
  | ParabolicSARParams
  | IchimokuParams
  | RSIParams
  | MACDParams
  | StochasticParams
  | StochasticRSIParams
  | WilliamsRParams
  | CCIParams
  | ATRParams
  | ADXParams
  | ROCParams
  | MomentumParams
  | CMFParams
  | MFIParams
  | AroonParams
  | AwesomeOscillatorParams
  | Record<string, number>; // Generic fallback

// Indicator metadata for UI
export interface IndicatorMetadata {
  type: IndicatorType;
  name: string;
  shortName: string;
  category: IndicatorCategory;
  defaultParams: IndicatorParams;
  defaultColor: string;
  description?: string;
  outputs?: string[]; // For multi-line indicators
}

// Indicator calculation function type
export type IndicatorCalculation<P extends IndicatorParams, O> = (
  data: OHLCV[],
  params: P
) => O;
