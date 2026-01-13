/**
 * Hooks Index
 * Re-exports all custom hooks
 */

export { useDebounce } from './useDebounce';
export { useQuote } from './useQuote';
export { useStockData } from './useStockData';
export { useChartResize } from './useChartResize';
export {
  useIndicator,
  useMultipleIndicators,
  isSimpleOutput,
  isBollingerOutput,
  isIchimokuOutput,
  isMACDOutput,
  isStochasticOutput,
} from './useIndicator';
export type {
  IndicatorResult,
  IndicatorConfig,
  UseIndicatorOptions,
  UseIndicatorResult,
} from './useIndicator';
