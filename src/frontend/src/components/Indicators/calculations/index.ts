/**
 * Indicator Calculations Index
 * 
 * Exports all indicator calculation functions and provides a factory
 * function to get calculations by indicator type.
 *
 * TASK-056: Indicator Calculation Index
 */

// Type definitions
export * from './types';

// Moving Averages
export { calculateSMA, calculateSMAFromValues, DEFAULT_SMA_PARAMS } from './sma';
export { calculateEMA, calculateEMAFromValues, getEMAMultiplier, DEFAULT_EMA_PARAMS } from './ema';
export { calculateWMA, calculateWMAFromValues, DEFAULT_WMA_PARAMS } from './wma';
export { calculateDEMA, calculateDEMAFromValues, DEFAULT_DEMA_PARAMS } from './dema';
export { calculateTEMA, calculateTEMAFromValues, DEFAULT_TEMA_PARAMS } from './tema';

// Volatility / Bands
export { calculateBollingerBands, DEFAULT_BOLLINGER_PARAMS } from './bollingerBands';
export { calculateEnvelope, calculateEnvelopeFromValues, DEFAULT_ENVELOPE_PARAMS } from './envelope';
export { calculateATR, calculateATRFromValues, calculateTrueRange, calculateTrueRangeArray, DEFAULT_ATR_PARAMS } from './atr';

// Trend Indicators
export { calculateParabolicSAR, calculateParabolicSARWithTrend, DEFAULT_PARABOLIC_SAR_PARAMS } from './parabolicSar';
export { calculateIchimoku, getCloudColor, DEFAULT_ICHIMOKU_PARAMS } from './ichimoku';
export { calculateADX, getADXStrength, getADXDirection, DEFAULT_ADX_PARAMS, ADX_LEVELS } from './adx';
export { calculateAroon, calculateAroonOscillator, calculateAroonFromValues, getAroonSignal, DEFAULT_AROON_PARAMS, AROON_LEVELS } from './aroon';

// Momentum Oscillators
export { calculateRSI, calculateRSIFromValues, getRSISignal, DEFAULT_RSI_PARAMS, RSI_LEVELS } from './rsi';
export { calculateMACD, calculateMACDFromValues, getMACDSignal, DEFAULT_MACD_PARAMS } from './macd';
export { calculateStochastic, calculateFastStochastic, calculateStochasticFromValues, getStochasticSignal, DEFAULT_STOCHASTIC_PARAMS, STOCHASTIC_LEVELS } from './stochastic';
export { calculateStochasticRSI, getStochasticRSISignal, DEFAULT_STOCH_RSI_PARAMS, STOCH_RSI_LEVELS } from './stochasticRsi';
export { calculateWilliamsR, calculateWilliamsRFromValues, getWilliamsRSignal, DEFAULT_WILLIAMS_R_PARAMS, WILLIAMS_R_LEVELS } from './williamsR';
export { calculateCCI, calculateCCIFromValues, getCCISignal, DEFAULT_CCI_PARAMS, CCI_LEVELS } from './cci';
export { calculateROC, calculateROCFromValues, getROCSignal, DEFAULT_ROC_PARAMS } from './roc';
export { calculateMomentum, calculateMomentumFromValues, getMomentumSignal, DEFAULT_MOMENTUM_PARAMS } from './momentum';
export { calculateAwesomeOscillator, calculateAwesomeOscillatorWithColors, calculateAwesomeOscillatorFromValues, getAwesomeOscillatorSignal, detectZeroLineCross, DEFAULT_AO_PARAMS } from './awesomeOscillator';

// Volume Indicators
export { calculateVWAP, calculateVWAPWithBands, DEFAULT_VWAP_PARAMS } from './vwap';
export { calculateOBV, calculateOBVFromValues, calculateOBVWithSignal, getOBVSignal } from './obv';
export { calculateCMF, calculateCMFFromValues, getCMFSignal, DEFAULT_CMF_PARAMS } from './cmf';
export { calculateMFI, calculateMFIFromValues, getMFISignal, DEFAULT_MFI_PARAMS, MFI_LEVELS } from './mfi';

// Indicator type enum for factory function
export type IndicatorType = 
  // Moving Averages
  | 'sma'
  | 'ema'
  | 'wma'
  | 'dema'
  | 'tema'
  // Volatility / Bands
  | 'bollingerBands'
  | 'envelope'
  | 'atr'
  // Trend
  | 'parabolicSar'
  | 'ichimoku'
  | 'adx'
  | 'aroon'
  // Momentum Oscillators
  | 'rsi'
  | 'macd'
  | 'stochastic'
  | 'stochasticRsi'
  | 'williamsR'
  | 'cci'
  | 'roc'
  | 'momentum'
  | 'awesomeOscillator'
  // Volume
  | 'vwap'
  | 'obv'
  | 'cmf'
  | 'mfi';

// Import calculation functions for factory
import { calculateSMA } from './sma';
import { calculateEMA } from './ema';
import { calculateWMA } from './wma';
import { calculateDEMA } from './dema';
import { calculateTEMA } from './tema';
import { calculateBollingerBands } from './bollingerBands';
import { calculateEnvelope } from './envelope';
import { calculateATR } from './atr';
import { calculateParabolicSAR } from './parabolicSar';
import { calculateIchimoku } from './ichimoku';
import { calculateADX } from './adx';
import { calculateAroon } from './aroon';
import { calculateRSI } from './rsi';
import { calculateMACD } from './macd';
import { calculateStochastic } from './stochastic';
import { calculateStochasticRSI } from './stochasticRsi';
import { calculateWilliamsR } from './williamsR';
import { calculateCCI } from './cci';
import { calculateROC } from './roc';
import { calculateMomentum } from './momentum';
import { calculateAwesomeOscillator } from './awesomeOscillator';
import { calculateVWAP } from './vwap';
import { calculateOBV } from './obv';
import { calculateCMF } from './cmf';
import { calculateMFI } from './mfi';
import type { IndicatorInput } from './types';

// Generic calculation function type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CalculationFunction = (data: IndicatorInput, params?: any) => any;

/**
 * Factory function to get indicator calculation by type
 * 
 * @param type - Indicator type
 * @returns Calculation function for the specified indicator
 * 
 * @example
 * const calculate = getIndicatorCalculation('sma');
 * const result = calculate(data, { period: 20 });
 */
export const getIndicatorCalculation = (type: IndicatorType): CalculationFunction => {
  const calculations: Record<IndicatorType, CalculationFunction> = {
    // Moving Averages
    sma: calculateSMA,
    ema: calculateEMA,
    wma: calculateWMA,
    dema: calculateDEMA,
    tema: calculateTEMA,
    // Volatility / Bands
    bollingerBands: calculateBollingerBands,
    envelope: calculateEnvelope,
    atr: calculateATR,
    // Trend
    parabolicSar: calculateParabolicSAR,
    ichimoku: calculateIchimoku,
    adx: calculateADX,
    aroon: calculateAroon,
    // Momentum Oscillators
    rsi: calculateRSI,
    macd: calculateMACD,
    stochastic: calculateStochastic,
    stochasticRsi: calculateStochasticRSI,
    williamsR: calculateWilliamsR,
    cci: calculateCCI,
    roc: calculateROC,
    momentum: calculateMomentum,
    awesomeOscillator: calculateAwesomeOscillator,
    // Volume
    vwap: calculateVWAP,
    obv: calculateOBV,
    cmf: calculateCMF,
    mfi: calculateMFI,
  };

  const calculation = calculations[type];
  if (!calculation) {
    throw new Error(`Unknown indicator type: ${type}`);
  }

  return calculation;
};

/**
 * Indicator metadata for UI display
 */
export interface IndicatorMetadata {
  type: IndicatorType;
  name: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume';
  isOverlay: boolean;
  defaultParams: Record<string, number>;
}

/**
 * Get all available indicators with metadata
 */
export const getIndicatorMetadata = (): IndicatorMetadata[] => [
  // Moving Averages (Overlay)
  { type: 'sma', name: 'Simple Moving Average', category: 'trend', isOverlay: true, defaultParams: { period: 20 } },
  { type: 'ema', name: 'Exponential Moving Average', category: 'trend', isOverlay: true, defaultParams: { period: 20 } },
  { type: 'wma', name: 'Weighted Moving Average', category: 'trend', isOverlay: true, defaultParams: { period: 20 } },
  { type: 'dema', name: 'Double EMA', category: 'trend', isOverlay: true, defaultParams: { period: 20 } },
  { type: 'tema', name: 'Triple EMA', category: 'trend', isOverlay: true, defaultParams: { period: 20 } },
  
  // Volatility / Bands (Overlay)
  { type: 'bollingerBands', name: 'Bollinger Bands', category: 'volatility', isOverlay: true, defaultParams: { period: 20, stdDevMultiplier: 2 } },
  { type: 'envelope', name: 'Moving Average Envelope', category: 'volatility', isOverlay: true, defaultParams: { period: 20, percentage: 2.5 } },
  { type: 'parabolicSar', name: 'Parabolic SAR', category: 'trend', isOverlay: true, defaultParams: { step: 0.02, max: 0.2 } },
  { type: 'ichimoku', name: 'Ichimoku Cloud', category: 'trend', isOverlay: true, defaultParams: { tenkanPeriod: 9, kijunPeriod: 26, senkouPeriod: 52 } },
  { type: 'vwap', name: 'VWAP', category: 'volume', isOverlay: true, defaultParams: {} },
  
  // Oscillators (Separate Pane)
  { type: 'rsi', name: 'RSI', category: 'momentum', isOverlay: false, defaultParams: { period: 14 } },
  { type: 'macd', name: 'MACD', category: 'momentum', isOverlay: false, defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } },
  { type: 'stochastic', name: 'Stochastic', category: 'momentum', isOverlay: false, defaultParams: { kPeriod: 14, dPeriod: 3, smooth: 3 } },
  { type: 'stochasticRsi', name: 'Stochastic RSI', category: 'momentum', isOverlay: false, defaultParams: { rsiPeriod: 14, stochPeriod: 14, kSmooth: 3, dPeriod: 3 } },
  { type: 'williamsR', name: 'Williams %R', category: 'momentum', isOverlay: false, defaultParams: { period: 14 } },
  { type: 'cci', name: 'CCI', category: 'momentum', isOverlay: false, defaultParams: { period: 20 } },
  { type: 'atr', name: 'ATR', category: 'volatility', isOverlay: false, defaultParams: { period: 14 } },
  { type: 'adx', name: 'ADX', category: 'trend', isOverlay: false, defaultParams: { period: 14 } },
  { type: 'roc', name: 'Rate of Change', category: 'momentum', isOverlay: false, defaultParams: { period: 12 } },
  { type: 'momentum', name: 'Momentum', category: 'momentum', isOverlay: false, defaultParams: { period: 10 } },
  { type: 'awesomeOscillator', name: 'Awesome Oscillator', category: 'momentum', isOverlay: false, defaultParams: { fastPeriod: 5, slowPeriod: 34 } },
  { type: 'aroon', name: 'Aroon', category: 'trend', isOverlay: false, defaultParams: { period: 25 } },
  
  // Volume (Separate Pane)
  { type: 'obv', name: 'On-Balance Volume', category: 'volume', isOverlay: false, defaultParams: {} },
  { type: 'cmf', name: 'Chaikin Money Flow', category: 'volume', isOverlay: false, defaultParams: { period: 20 } },
  { type: 'mfi', name: 'Money Flow Index', category: 'volume', isOverlay: false, defaultParams: { period: 14 } },
];

/**
 * Get indicators by category
 */
export const getIndicatorsByCategory = (category: 'trend' | 'momentum' | 'volatility' | 'volume'): IndicatorMetadata[] => {
  return getIndicatorMetadata().filter(ind => ind.category === category);
};

/**
 * Get overlay indicators (displayed on price chart)
 */
export const getOverlayIndicators = (): IndicatorMetadata[] => {
  return getIndicatorMetadata().filter(ind => ind.isOverlay);
};

/**
 * Get oscillator indicators (displayed in separate pane)
 */
export const getOscillatorIndicators = (): IndicatorMetadata[] => {
  return getIndicatorMetadata().filter(ind => !ind.isOverlay);
};
