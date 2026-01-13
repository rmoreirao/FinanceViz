/**
 * Indicator Context & State Management
 * Manages overlay and oscillator indicator state
 *
 * TASK-029: Indicator Context & State
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  OverlayIndicatorType,
  OscillatorIndicatorType,
  IndicatorType,
  MovingAverageParams,
  BollingerBandsParams,
  EnvelopeParams,
  ParabolicSarParams,
  IchimokuParams,
  RsiParams,
  MacdParams,
  StochasticParams,
  CciParams,
  AtrParams,
  AdxParams,
  RocParams,
  MomentumParams,
  CmfParams,
  MfiParams,
  AroonParams,
  ObvParams,
  AwesomeOscillatorParams,
} from '../types/indicators';

/**
 * Base indicator interface
 */
interface BaseIndicator {
  id: string;
  visible: boolean;
  color: string;
  lineWidth: number;
}

/**
 * Overlay indicator with type and parameters
 */
export interface OverlayIndicator extends BaseIndicator {
  type: OverlayIndicatorType;
  params: OverlayIndicatorParams;
}

/**
 * Oscillator indicator with type and parameters
 */
export interface OscillatorIndicator extends BaseIndicator {
  type: OscillatorIndicatorType;
  params: OscillatorIndicatorParams;
}

/**
 * Union type for overlay indicator parameters
 */
export type OverlayIndicatorParams =
  | MovingAverageParams
  | BollingerBandsParams
  | EnvelopeParams
  | ParabolicSarParams
  | IchimokuParams;

/**
 * Union type for oscillator indicator parameters
 */
export type OscillatorIndicatorParams =
  | RsiParams
  | MacdParams
  | StochasticParams
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
 * Indicator state shape
 */
export interface IndicatorState {
  overlays: OverlayIndicator[];
  oscillators: OscillatorIndicator[];
}

/**
 * Action types for indicator reducer
 */
type IndicatorAction =
  | { type: 'ADD_OVERLAY'; payload: OverlayIndicator }
  | { type: 'REMOVE_OVERLAY'; payload: string }
  | { type: 'UPDATE_OVERLAY'; payload: { id: string; updates: Partial<OverlayIndicator> } }
  | { type: 'TOGGLE_OVERLAY_VISIBILITY'; payload: string }
  | { type: 'ADD_OSCILLATOR'; payload: OscillatorIndicator }
  | { type: 'REMOVE_OSCILLATOR'; payload: string }
  | { type: 'UPDATE_OSCILLATOR'; payload: { id: string; updates: Partial<OscillatorIndicator> } }
  | { type: 'TOGGLE_OSCILLATOR_VISIBILITY'; payload: string }
  | { type: 'CLEAR_ALL' };

/**
 * Default colors for indicators
 */
const DEFAULT_COLORS = [
  '#2196F3', // Blue
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#4CAF50', // Green
  '#E91E63', // Pink
  '#00BCD4', // Cyan
  '#FF5722', // Deep Orange
  '#673AB7', // Deep Purple
];

/**
 * Get next available color
 */
const getNextColor = (usedColors: string[]): string => {
  const available = DEFAULT_COLORS.find(c => !usedColors.includes(c));
  return available || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
};

/**
 * Generate unique ID for indicator
 */
const generateId = (): string => {
  return `indicator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Default parameters for each indicator type
 */
export const getDefaultParams = (type: IndicatorType): OverlayIndicatorParams | OscillatorIndicatorParams => {
  switch (type) {
    // Overlay indicators
    case 'sma':
    case 'ema':
    case 'wma':
    case 'dema':
    case 'tema':
      return { period: 20, source: 'close' } as MovingAverageParams;
    case 'vwap':
      return { period: 14, source: 'close' } as MovingAverageParams;
    case 'bollingerBands':
      return { period: 20, stdDev: 2, source: 'close' } as BollingerBandsParams;
    case 'envelope':
      return { period: 20, percentage: 2.5 } as EnvelopeParams;
    case 'parabolicSar':
      return { step: 0.02, max: 0.2 } as ParabolicSarParams;
    case 'ichimoku':
      return { tenkanPeriod: 9, kijunPeriod: 26, senkouPeriod: 52 } as IchimokuParams;
    
    // Oscillator indicators
    case 'rsi':
      return { period: 14, overbought: 70, oversold: 30 } as RsiParams;
    case 'macd':
      return { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 } as MacdParams;
    case 'stochastic':
    case 'stochasticRsi':
      return { kPeriod: 14, dPeriod: 3, smooth: 3, overbought: 80, oversold: 20 } as StochasticParams;
    case 'williamsR':
      return { period: 14, overbought: -20, oversold: -80 } as RsiParams;
    case 'cci':
      return { period: 20 } as CciParams;
    case 'atr':
      return { period: 14 } as AtrParams;
    case 'adx':
      return { period: 14 } as AdxParams;
    case 'roc':
      return { period: 12 } as RocParams;
    case 'momentum':
      return { period: 10 } as MomentumParams;
    case 'obv':
      return {} as ObvParams;
    case 'cmf':
      return { period: 20 } as CmfParams;
    case 'mfi':
      return { period: 14, overbought: 80, oversold: 20 } as MfiParams;
    case 'aroon':
      return { period: 25 } as AroonParams;
    case 'awesomeOscillator':
      return { fastPeriod: 5, slowPeriod: 34 } as AwesomeOscillatorParams;
    default:
      return { period: 14, overbought: 70, oversold: 30 } as RsiParams;
  }
};

/**
 * Initial state
 */
const initialState: IndicatorState = {
  overlays: [],
  oscillators: [],
};

/**
 * Indicator reducer
 */
const indicatorReducer = (state: IndicatorState, action: IndicatorAction): IndicatorState => {
  switch (action.type) {
    case 'ADD_OVERLAY':
      return {
        ...state,
        overlays: [...state.overlays, action.payload],
      };

    case 'REMOVE_OVERLAY':
      return {
        ...state,
        overlays: state.overlays.filter(o => o.id !== action.payload),
      };

    case 'UPDATE_OVERLAY':
      return {
        ...state,
        overlays: state.overlays.map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload.updates } : o
        ),
      };

    case 'TOGGLE_OVERLAY_VISIBILITY':
      return {
        ...state,
        overlays: state.overlays.map(o =>
          o.id === action.payload ? { ...o, visible: !o.visible } : o
        ),
      };

    case 'ADD_OSCILLATOR':
      return {
        ...state,
        oscillators: [...state.oscillators, action.payload],
      };

    case 'REMOVE_OSCILLATOR':
      return {
        ...state,
        oscillators: state.oscillators.filter(o => o.id !== action.payload),
      };

    case 'UPDATE_OSCILLATOR':
      return {
        ...state,
        oscillators: state.oscillators.map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload.updates } : o
        ),
      };

    case 'TOGGLE_OSCILLATOR_VISIBILITY':
      return {
        ...state,
        oscillators: state.oscillators.map(o =>
          o.id === action.payload ? { ...o, visible: !o.visible } : o
        ),
      };

    case 'CLEAR_ALL':
      return initialState;

    default:
      return state;
  }
};

/**
 * Context value interface
 */
interface IndicatorContextValue {
  state: IndicatorState;
  addOverlay: (type: OverlayIndicatorType, params?: Partial<OverlayIndicatorParams>) => void;
  removeOverlay: (id: string) => void;
  updateOverlay: (id: string, updates: Partial<OverlayIndicator>) => void;
  toggleOverlayVisibility: (id: string) => void;
  addOscillator: (type: OscillatorIndicatorType, params?: Partial<OscillatorIndicatorParams>) => void;
  removeOscillator: (id: string) => void;
  updateOscillator: (id: string, updates: Partial<OscillatorIndicator>) => void;
  toggleOscillatorVisibility: (id: string) => void;
  clearAll: () => void;
}

/**
 * Create context
 */
const IndicatorContext = createContext<IndicatorContextValue | undefined>(undefined);

/**
 * Provider props
 */
interface IndicatorProviderProps {
  children: ReactNode;
}

/**
 * Indicator Provider Component
 */
export const IndicatorProvider: React.FC<IndicatorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(indicatorReducer, initialState);

  const addOverlay = useCallback((type: OverlayIndicatorType, params?: Partial<OverlayIndicatorParams>) => {
    const usedColors = state.overlays.map(o => o.color);
    const indicator: OverlayIndicator = {
      id: generateId(),
      type,
      visible: true,
      color: getNextColor(usedColors),
      lineWidth: 2,
      params: { ...getDefaultParams(type), ...params } as OverlayIndicatorParams,
    };
    dispatch({ type: 'ADD_OVERLAY', payload: indicator });
  }, [state.overlays]);

  const removeOverlay = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_OVERLAY', payload: id });
  }, []);

  const updateOverlay = useCallback((id: string, updates: Partial<OverlayIndicator>) => {
    dispatch({ type: 'UPDATE_OVERLAY', payload: { id, updates } });
  }, []);

  const toggleOverlayVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_OVERLAY_VISIBILITY', payload: id });
  }, []);

  const addOscillator = useCallback((type: OscillatorIndicatorType, params?: Partial<OscillatorIndicatorParams>) => {
    const usedColors = state.oscillators.map(o => o.color);
    const indicator: OscillatorIndicator = {
      id: generateId(),
      type,
      visible: true,
      color: getNextColor(usedColors),
      lineWidth: 2,
      params: { ...getDefaultParams(type), ...params } as OscillatorIndicatorParams,
    };
    dispatch({ type: 'ADD_OSCILLATOR', payload: indicator });
  }, [state.oscillators]);

  const removeOscillator = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_OSCILLATOR', payload: id });
  }, []);

  const updateOscillator = useCallback((id: string, updates: Partial<OscillatorIndicator>) => {
    dispatch({ type: 'UPDATE_OSCILLATOR', payload: { id, updates } });
  }, []);

  const toggleOscillatorVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_OSCILLATOR_VISIBILITY', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const value: IndicatorContextValue = {
    state,
    addOverlay,
    removeOverlay,
    updateOverlay,
    toggleOverlayVisibility,
    addOscillator,
    removeOscillator,
    updateOscillator,
    toggleOscillatorVisibility,
    clearAll,
  };

  return (
    <IndicatorContext.Provider value={value}>
      {children}
    </IndicatorContext.Provider>
  );
};

/**
 * Custom hook to use indicator context
 */
export const useIndicators = (): IndicatorContextValue => {
  const context = useContext(IndicatorContext);
  if (context === undefined) {
    throw new Error('useIndicators must be used within an IndicatorProvider');
  }
  return context;
};
