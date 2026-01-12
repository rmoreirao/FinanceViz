/**
 * Indicator Context
 * Manages active technical indicators (overlays and oscillators)
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { OverlayIndicator, OscillatorIndicator, IndicatorParams } from '../types';

// State interface
interface IndicatorState {
  overlays: OverlayIndicator[];
  oscillators: OscillatorIndicator[];
}

// Action types
type IndicatorAction =
  | { type: 'ADD_OVERLAY'; payload: OverlayIndicator }
  | { type: 'ADD_OSCILLATOR'; payload: OscillatorIndicator }
  | { type: 'REMOVE_INDICATOR'; payload: string }
  | { type: 'UPDATE_INDICATOR_PARAMS'; payload: { id: string; params: IndicatorParams } }
  | { type: 'TOGGLE_INDICATOR_VISIBILITY'; payload: string }
  | { type: 'UPDATE_OSCILLATOR_HEIGHT'; payload: { id: string; height: number } }
  | { type: 'CLEAR_ALL' };

// Initial state
const initialState: IndicatorState = {
  overlays: [],
  oscillators: [],
};

// Reducer
function indicatorReducer(state: IndicatorState, action: IndicatorAction): IndicatorState {
  switch (action.type) {
    case 'ADD_OVERLAY':
      return {
        ...state,
        overlays: [...state.overlays, action.payload],
      };
    case 'ADD_OSCILLATOR':
      return {
        ...state,
        oscillators: [...state.oscillators, action.payload],
      };
    case 'REMOVE_INDICATOR':
      return {
        ...state,
        overlays: state.overlays.filter((i) => i.id !== action.payload),
        oscillators: state.oscillators.filter((i) => i.id !== action.payload),
      };
    case 'UPDATE_INDICATOR_PARAMS':
      return {
        ...state,
        overlays: state.overlays.map((i) =>
          i.id === action.payload.id ? { ...i, params: action.payload.params } : i
        ),
        oscillators: state.oscillators.map((i) =>
          i.id === action.payload.id ? { ...i, params: action.payload.params } : i
        ),
      };
    case 'TOGGLE_INDICATOR_VISIBILITY':
      return {
        ...state,
        overlays: state.overlays.map((i) =>
          i.id === action.payload ? { ...i, visible: !i.visible } : i
        ),
        oscillators: state.oscillators.map((i) =>
          i.id === action.payload ? { ...i, visible: !i.visible } : i
        ),
      };
    case 'UPDATE_OSCILLATOR_HEIGHT':
      return {
        ...state,
        oscillators: state.oscillators.map((i) =>
          i.id === action.payload.id ? { ...i, height: action.payload.height } : i
        ),
      };
    case 'CLEAR_ALL':
      return initialState;
    default:
      return state;
  }
}

// Context interface
interface IndicatorContextValue {
  state: IndicatorState;
  addOverlay: (indicator: OverlayIndicator) => void;
  addOscillator: (indicator: OscillatorIndicator) => void;
  removeIndicator: (id: string) => void;
  updateIndicatorParams: (id: string, params: IndicatorParams) => void;
  toggleIndicatorVisibility: (id: string) => void;
  updateOscillatorHeight: (id: string, height: number) => void;
  clearAll: () => void;
  activeCount: number;
}

// Create context
const IndicatorContext = createContext<IndicatorContextValue | undefined>(undefined);

// Provider component
interface IndicatorProviderProps {
  children: React.ReactNode;
}

export function IndicatorProvider({ children }: IndicatorProviderProps) {
  const [state, dispatch] = useReducer(indicatorReducer, initialState);

  const addOverlay = useCallback((indicator: OverlayIndicator) => {
    dispatch({ type: 'ADD_OVERLAY', payload: indicator });
  }, []);

  const addOscillator = useCallback((indicator: OscillatorIndicator) => {
    dispatch({ type: 'ADD_OSCILLATOR', payload: indicator });
  }, []);

  const removeIndicator = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_INDICATOR', payload: id });
  }, []);

  const updateIndicatorParams = useCallback((id: string, params: IndicatorParams) => {
    dispatch({ type: 'UPDATE_INDICATOR_PARAMS', payload: { id, params } });
  }, []);

  const toggleIndicatorVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_INDICATOR_VISIBILITY', payload: id });
  }, []);

  const updateOscillatorHeight = useCallback((id: string, height: number) => {
    dispatch({ type: 'UPDATE_OSCILLATOR_HEIGHT', payload: { id, height } });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const activeCount = state.overlays.length + state.oscillators.length;

  const value: IndicatorContextValue = {
    state,
    addOverlay,
    addOscillator,
    removeIndicator,
    updateIndicatorParams,
    toggleIndicatorVisibility,
    updateOscillatorHeight,
    clearAll,
    activeCount,
  };

  return <IndicatorContext.Provider value={value}>{children}</IndicatorContext.Provider>;
}

// Hook to use indicator context
export function useIndicatorContext() {
  const context = useContext(IndicatorContext);
  if (context === undefined) {
    throw new Error('useIndicatorContext must be used within an IndicatorProvider');
  }
  return context;
}
