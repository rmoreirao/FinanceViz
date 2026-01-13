/**
 * Technical Indicators Index
 * Exports all calculation functions and indicator metadata
 */

// Export types
export * from './types';

// Export overlay indicator calculations
export { calculateSMA, smaIndicator } from './sma';
export { calculateEMA, calculateEMAFromValues, emaIndicator } from './ema';
export { calculateWMA, wmaIndicator } from './wma';
export { calculateDEMA, demaIndicator } from './dema';
export { calculateTEMA, temaIndicator } from './tema';
export { calculateBollingerBands, bollingerBandsIndicator } from './bollingerBands';
export { calculateVWAP, vwapIndicator } from './vwap';
export { calculateEnvelope, envelopeIndicator } from './envelope';
export { calculateParabolicSAR, parabolicSarIndicator } from './parabolicSar';
export { calculateIchimoku, ichimokuIndicator } from './ichimoku';

// Export oscillator indicator calculations
export { calculateRSI, rsiIndicator } from './rsi';
export { calculateMACD, macdIndicator } from './macd';
export { calculateStochastic, stochasticIndicator } from './stochastic';
export { calculateStochasticRSI, stochasticRsiIndicator } from './stochasticRsi';
export { calculateWilliamsR, williamsRIndicator } from './williamsR';
export { calculateCCI, cciIndicator } from './cci';
export { calculateATR, atrIndicator } from './atr';
export { calculateADX, adxIndicator } from './adx';
export { calculateROC, rocIndicator } from './roc';
export { calculateMomentum, momentumIndicator } from './momentum';
export { calculateOBV, obvIndicator } from './obv';
export { calculateCMF, cmfIndicator } from './cmf';
export { calculateMFI, mfiIndicator } from './mfi';
export { calculateAroon, aroonIndicator } from './aroon';
export { calculateAwesomeOscillator, awesomeOscillatorIndicator } from './awesomeOscillator';

// Import all indicators for the registry
import { smaIndicator } from './sma';
import { emaIndicator } from './ema';
import { wmaIndicator } from './wma';
import { demaIndicator } from './dema';
import { temaIndicator } from './tema';
import { bollingerBandsIndicator } from './bollingerBands';
import { vwapIndicator } from './vwap';
import { envelopeIndicator } from './envelope';
import { parabolicSarIndicator } from './parabolicSar';
import { ichimokuIndicator } from './ichimoku';
import { rsiIndicator } from './rsi';
import { macdIndicator } from './macd';
import { stochasticIndicator } from './stochastic';
import { stochasticRsiIndicator } from './stochasticRsi';
import { williamsRIndicator } from './williamsR';
import { cciIndicator } from './cci';
import { atrIndicator } from './atr';
import { adxIndicator } from './adx';
import { rocIndicator } from './roc';
import { momentumIndicator } from './momentum';
import { obvIndicator } from './obv';
import { cmfIndicator } from './cmf';
import { mfiIndicator } from './mfi';
import { aroonIndicator } from './aroon';
import { awesomeOscillatorIndicator } from './awesomeOscillator';

import type { IndicatorMeta } from './types';

/**
 * All overlay indicators (rendered on main price chart)
 */
export const overlayIndicators = [
  smaIndicator,
  emaIndicator,
  wmaIndicator,
  demaIndicator,
  temaIndicator,
  bollingerBandsIndicator,
  vwapIndicator,
  envelopeIndicator,
  parabolicSarIndicator,
  ichimokuIndicator,
] as const;

/**
 * All oscillator indicators (rendered in separate panes)
 */
export const oscillatorIndicators = [
  rsiIndicator,
  macdIndicator,
  stochasticIndicator,
  stochasticRsiIndicator,
  williamsRIndicator,
  cciIndicator,
  atrIndicator,
  adxIndicator,
  rocIndicator,
  momentumIndicator,
  obvIndicator,
  cmfIndicator,
  mfiIndicator,
  aroonIndicator,
  awesomeOscillatorIndicator,
] as const;

/**
 * All available indicators
 */
export const allIndicators = [...overlayIndicators, ...oscillatorIndicators] as const;

/**
 * Indicator metadata registry by type
 */
export const indicatorMetadataByType: Record<string, IndicatorMeta<unknown>> = {
  // Overlays
  SMA: smaIndicator.meta,
  EMA: emaIndicator.meta,
  WMA: wmaIndicator.meta,
  DEMA: demaIndicator.meta,
  TEMA: temaIndicator.meta,
  BB: bollingerBandsIndicator.meta,
  VWAP: vwapIndicator.meta,
  ENVELOPE: envelopeIndicator.meta,
  SAR: parabolicSarIndicator.meta,
  ICHIMOKU: ichimokuIndicator.meta,
  // Oscillators
  RSI: rsiIndicator.meta,
  MACD: macdIndicator.meta,
  STOCH: stochasticIndicator.meta,
  STOCHRSI: stochasticRsiIndicator.meta,
  WILLR: williamsRIndicator.meta,
  CCI: cciIndicator.meta,
  ATR: atrIndicator.meta,
  ADX: adxIndicator.meta,
  ROC: rocIndicator.meta,
  MOM: momentumIndicator.meta,
  OBV: obvIndicator.meta,
  CMF: cmfIndicator.meta,
  MFI: mfiIndicator.meta,
  AROON: aroonIndicator.meta,
  AO: awesomeOscillatorIndicator.meta,
};

/**
 * Get indicator metadata by type
 */
export function getIndicatorMeta(type: string): IndicatorMeta<unknown> | undefined {
  return indicatorMetadataByType[type];
}

/**
 * Get all overlay indicator metadata
 */
export function getOverlayIndicatorsMeta(): IndicatorMeta<unknown>[] {
  return overlayIndicators.map(ind => ind.meta as IndicatorMeta<unknown>);
}

/**
 * Get all oscillator indicator metadata
 */
export function getOscillatorIndicatorsMeta(): IndicatorMeta<unknown>[] {
  return oscillatorIndicators.map(ind => ind.meta as IndicatorMeta<unknown>);
}

/**
 * Indicator categories for UI grouping
 */
export const indicatorCategories = [
  {
    name: 'Trend',
    description: 'Trend-following indicators',
    types: ['SMA', 'EMA', 'WMA', 'DEMA', 'TEMA', 'BB', 'ENVELOPE', 'ICHIMOKU', 'SAR', 'ADX'],
  },
  {
    name: 'Momentum',
    description: 'Momentum and oscillator indicators',
    types: ['RSI', 'MACD', 'STOCH', 'STOCHRSI', 'WILLR', 'CCI', 'ROC', 'MOM', 'AO', 'AROON'],
  },
  {
    name: 'Volatility',
    description: 'Volatility indicators',
    types: ['ATR', 'BB'],
  },
  {
    name: 'Volume',
    description: 'Volume-based indicators',
    types: ['VWAP', 'OBV', 'CMF', 'MFI'],
  },
] as const;
