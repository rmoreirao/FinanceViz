/**
 * Indicator Types and Configurations
 * Defines all technical indicator types, parameters, and settings
 * 
 * TASK-004: Core Type Definitions
 */

/**
 * Indicator categories
 */
export type IndicatorCategory = 'overlay' | 'oscillator';

/**
 * Overlay indicator types (displayed on the main chart)
 */
export type OverlayIndicatorType =
  | 'sma'
  | 'ema'
  | 'wma'
  | 'dema'
  | 'tema'
  | 'vwap'
  | 'bollingerBands'
  | 'envelope'
  | 'parabolicSar'
  | 'ichimoku';

/**
 * Oscillator indicator types (displayed in separate pane)
 */
export type OscillatorIndicatorType =
  | 'rsi'
  | 'macd'
  | 'stochastic'
  | 'stochasticRsi'
  | 'williamsR'
  | 'cci'
  | 'atr'
  | 'adx'
  | 'roc'
  | 'momentum'
  | 'obv'
  | 'cmf'
  | 'mfi'
  | 'aroon'
  | 'awesomeOscillator';

/**
 * Combined indicator type
 */
export type IndicatorType = OverlayIndicatorType | OscillatorIndicatorType;

/**
 * Base indicator configuration
 */
export interface BaseIndicatorConfig {
  id: string;
  type: IndicatorType;
  category: IndicatorCategory;
  visible: boolean;
  color: string;
  lineWidth?: number;
}

/**
 * Moving Average parameters (SMA, EMA, WMA, DEMA, TEMA)
 */
export interface MovingAverageParams {
  period: number;
  source: 'close' | 'open' | 'high' | 'low' | 'hl2' | 'hlc3' | 'ohlc4';
}

/**
 * Bollinger Bands parameters
 */
export interface BollingerBandsParams {
  period: number;
  stdDev: number;
  source: 'close' | 'open' | 'high' | 'low';
}

/**
 * Envelope parameters
 */
export interface EnvelopeParams {
  period: number;
  percentage: number;
}

/**
 * Parabolic SAR parameters
 */
export interface ParabolicSarParams {
  step: number;
  max: number;
}

/**
 * Ichimoku Cloud parameters
 */
export interface IchimokuParams {
  tenkanPeriod: number;
  kijunPeriod: number;
  senkouPeriod: number;
}

/**
 * RSI parameters
 */
export interface RsiParams {
  period: number;
  overbought: number;
  oversold: number;
}

/**
 * MACD parameters
 */
export interface MacdParams {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
}

/**
 * Stochastic parameters
 */
export interface StochasticParams {
  kPeriod: number;
  dPeriod: number;
  smooth: number;
  overbought: number;
  oversold: number;
}

/**
 * Williams %R parameters
 */
export interface WilliamsRParams {
  period: number;
  overbought: number;
  oversold: number;
}

/**
 * CCI parameters
 */
export interface CciParams {
  period: number;
}

/**
 * ATR parameters
 */
export interface AtrParams {
  period: number;
}

/**
 * ADX parameters
 */
export interface AdxParams {
  period: number;
}

/**
 * ROC parameters
 */
export interface RocParams {
  period: number;
}

/**
 * Momentum parameters
 */
export interface MomentumParams {
  period: number;
}

/**
 * CMF parameters
 */
export interface CmfParams {
  period: number;
}

/**
 * MFI parameters
 */
export interface MfiParams {
  period: number;
  overbought: number;
  oversold: number;
}

/**
 * Aroon parameters
 */
export interface AroonParams {
  period: number;
}

/**
 * OBV parameters (On Balance Volume has no parameters, but we define an empty interface for consistency)
 */
export interface ObvParams {
  // OBV has no parameters
}

/**
 * Awesome Oscillator parameters
 */
export interface AwesomeOscillatorParams {
  fastPeriod: number;
  slowPeriod: number;
}

/**
 * Union type of all indicator parameters
 */
export type IndicatorParams =
  | MovingAverageParams
  | BollingerBandsParams
  | EnvelopeParams
  | ParabolicSarParams
  | IchimokuParams
  | RsiParams
  | MacdParams
  | StochasticParams
  | WilliamsRParams
  | CciParams
  | AtrParams
  | AdxParams
  | RocParams
  | MomentumParams
  | CmfParams
  | MfiParams
  | AroonParams
  | ObvParams
  | AwesomeOscillatorParams;

/**
 * Overlay indicator with specific params
 */
export interface OverlayIndicator extends BaseIndicatorConfig {
  category: 'overlay';
  type: OverlayIndicatorType;
  params: IndicatorParams;
}

/**
 * Oscillator indicator with specific params
 */
export interface OscillatorIndicator extends BaseIndicatorConfig {
  category: 'oscillator';
  type: OscillatorIndicatorType;
  params: IndicatorParams;
}

/**
 * Union type for all indicators
 */
export type Indicator = OverlayIndicator | OscillatorIndicator;

/**
 * Indicator output data point
 */
export interface IndicatorDataPoint {
  time: number;
  value: number;
}

/**
 * Multi-line indicator output (e.g., Bollinger Bands, MACD)
 */
export interface MultiLineIndicatorOutput {
  time: number;
  values: Record<string, number>;
}

/**
 * Indicator calculation result
 */
export type IndicatorOutput = IndicatorDataPoint[] | MultiLineIndicatorOutput[];

/**
 * Indicator metadata for UI
 */
export interface IndicatorInfo {
  type: IndicatorType;
  name: string;
  shortName: string;
  category: IndicatorCategory;
  description: string;
  defaultParams: IndicatorParams;
  defaultColor: string;
}

/**
 * Predefined indicator configurations
 */
export const INDICATOR_CONFIGS: IndicatorInfo[] = [
  // Overlay Indicators
  {
    type: 'sma',
    name: 'Simple Moving Average',
    shortName: 'SMA',
    category: 'overlay',
    description: 'Average of closing prices over a specified period',
    defaultParams: { period: 20, source: 'close' } as MovingAverageParams,
    defaultColor: '#2196F3',
  },
  {
    type: 'ema',
    name: 'Exponential Moving Average',
    shortName: 'EMA',
    category: 'overlay',
    description: 'Weighted average giving more importance to recent prices',
    defaultParams: { period: 20, source: 'close' } as MovingAverageParams,
    defaultColor: '#FF9800',
  },
  {
    type: 'wma',
    name: 'Weighted Moving Average',
    shortName: 'WMA',
    category: 'overlay',
    description: 'Linear weighted moving average',
    defaultParams: { period: 20, source: 'close' } as MovingAverageParams,
    defaultColor: '#9C27B0',
  },
  {
    type: 'dema',
    name: 'Double Exponential Moving Average',
    shortName: 'DEMA',
    category: 'overlay',
    description: 'Faster-responding moving average with reduced lag',
    defaultParams: { period: 20, source: 'close' } as MovingAverageParams,
    defaultColor: '#00BCD4',
  },
  {
    type: 'tema',
    name: 'Triple Exponential Moving Average',
    shortName: 'TEMA',
    category: 'overlay',
    description: 'Even faster-responding moving average',
    defaultParams: { period: 20, source: 'close' } as MovingAverageParams,
    defaultColor: '#4CAF50',
  },
  {
    type: 'vwap',
    name: 'Volume Weighted Average Price',
    shortName: 'VWAP',
    category: 'overlay',
    description: 'Average price weighted by volume',
    defaultParams: { period: 14, source: 'close' } as MovingAverageParams,
    defaultColor: '#673AB7',
  },
  {
    type: 'bollingerBands',
    name: 'Bollinger Bands',
    shortName: 'BB',
    category: 'overlay',
    description: 'Volatility bands around moving average',
    defaultParams: { period: 20, stdDev: 2, source: 'close' } as BollingerBandsParams,
    defaultColor: '#607D8B',
  },
  {
    type: 'envelope',
    name: 'Moving Average Envelope',
    shortName: 'ENV',
    category: 'overlay',
    description: 'Percentage bands around moving average',
    defaultParams: { period: 20, percentage: 2.5 } as EnvelopeParams,
    defaultColor: '#795548',
  },
  {
    type: 'parabolicSar',
    name: 'Parabolic SAR',
    shortName: 'PSAR',
    category: 'overlay',
    description: 'Stop and reverse trend indicator',
    defaultParams: { step: 0.02, max: 0.2 } as ParabolicSarParams,
    defaultColor: '#E91E63',
  },
  {
    type: 'ichimoku',
    name: 'Ichimoku Cloud',
    shortName: 'ICHI',
    category: 'overlay',
    description: 'Comprehensive trend indicator with cloud support/resistance',
    defaultParams: { tenkanPeriod: 9, kijunPeriod: 26, senkouPeriod: 52 } as IchimokuParams,
    defaultColor: '#3F51B5',
  },
  // Oscillator Indicators
  {
    type: 'rsi',
    name: 'Relative Strength Index',
    shortName: 'RSI',
    category: 'oscillator',
    description: 'Momentum oscillator measuring speed and change of price movements',
    defaultParams: { period: 14, overbought: 70, oversold: 30 } as RsiParams,
    defaultColor: '#9C27B0',
  },
  {
    type: 'macd',
    name: 'Moving Average Convergence Divergence',
    shortName: 'MACD',
    category: 'oscillator',
    description: 'Trend-following momentum indicator',
    defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } as MacdParams,
    defaultColor: '#2196F3',
  },
  {
    type: 'stochastic',
    name: 'Stochastic Oscillator',
    shortName: 'STOCH',
    category: 'oscillator',
    description: 'Momentum indicator comparing closing price to price range',
    defaultParams: { kPeriod: 14, dPeriod: 3, smooth: 3, overbought: 80, oversold: 20 } as StochasticParams,
    defaultColor: '#FF5722',
  },
  {
    type: 'stochasticRsi',
    name: 'Stochastic RSI',
    shortName: 'SRSI',
    category: 'oscillator',
    description: 'Stochastic oscillator applied to RSI values',
    defaultParams: { kPeriod: 14, dPeriod: 3, smooth: 3, overbought: 80, oversold: 20 } as StochasticParams,
    defaultColor: '#8BC34A',
  },
  {
    type: 'williamsR',
    name: 'Williams %R',
    shortName: '%R',
    category: 'oscillator',
    description: 'Momentum indicator showing overbought/oversold levels',
    defaultParams: { period: 14, overbought: -20, oversold: -80 } as WilliamsRParams,
    defaultColor: '#00BCD4',
  },
  {
    type: 'cci',
    name: 'Commodity Channel Index',
    shortName: 'CCI',
    category: 'oscillator',
    description: 'Oscillator measuring price deviation from average',
    defaultParams: { period: 20 } as CciParams,
    defaultColor: '#FFC107',
  },
  {
    type: 'atr',
    name: 'Average True Range',
    shortName: 'ATR',
    category: 'oscillator',
    description: 'Volatility indicator measuring price range',
    defaultParams: { period: 14 } as AtrParams,
    defaultColor: '#FF9800',
  },
  {
    type: 'adx',
    name: 'Average Directional Index',
    shortName: 'ADX',
    category: 'oscillator',
    description: 'Trend strength indicator',
    defaultParams: { period: 14 } as AdxParams,
    defaultColor: '#673AB7',
  },
  {
    type: 'roc',
    name: 'Rate of Change',
    shortName: 'ROC',
    category: 'oscillator',
    description: 'Momentum oscillator measuring percentage change',
    defaultParams: { period: 12 } as RocParams,
    defaultColor: '#03A9F4',
  },
  {
    type: 'momentum',
    name: 'Momentum',
    shortName: 'MOM',
    category: 'oscillator',
    description: 'Price change over a specified period',
    defaultParams: { period: 10 } as MomentumParams,
    defaultColor: '#4CAF50',
  },
  {
    type: 'obv',
    name: 'On-Balance Volume',
    shortName: 'OBV',
    category: 'oscillator',
    description: 'Cumulative volume-based momentum indicator',
    defaultParams: { period: 14 } as MomentumParams,
    defaultColor: '#9E9E9E',
  },
  {
    type: 'cmf',
    name: 'Chaikin Money Flow',
    shortName: 'CMF',
    category: 'oscillator',
    description: 'Volume-weighted measure of accumulation/distribution',
    defaultParams: { period: 20 } as CmfParams,
    defaultColor: '#795548',
  },
  {
    type: 'mfi',
    name: 'Money Flow Index',
    shortName: 'MFI',
    category: 'oscillator',
    description: 'Volume-weighted RSI',
    defaultParams: { period: 14, overbought: 80, oversold: 20 } as MfiParams,
    defaultColor: '#E91E63',
  },
  {
    type: 'aroon',
    name: 'Aroon Indicator',
    shortName: 'AROON',
    category: 'oscillator',
    description: 'Identifies trend changes and strength',
    defaultParams: { period: 25 } as AroonParams,
    defaultColor: '#3F51B5',
  },
  {
    type: 'awesomeOscillator',
    name: 'Awesome Oscillator',
    shortName: 'AO',
    category: 'oscillator',
    description: 'Measures market momentum',
    defaultParams: { fastPeriod: 5, slowPeriod: 34 } as AwesomeOscillatorParams,
    defaultColor: '#22c55e',
  },
];

/**
 * Default indicator colors palette
 */
export const INDICATOR_COLORS = [
  '#2196F3', // Blue
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#4CAF50', // Green
  '#F44336', // Red
  '#00BCD4', // Cyan
  '#FF5722', // Deep Orange
  '#673AB7', // Deep Purple
  '#8BC34A', // Light Green
  '#E91E63', // Pink
];
