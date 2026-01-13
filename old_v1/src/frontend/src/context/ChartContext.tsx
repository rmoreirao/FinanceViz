/**
 * Chart Context
 * Manages global chart state: symbol, time range, interval, chart type
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ChartType, TimeRange, Interval } from '../types';

// State interface
interface ChartState {
  symbol: string;
  companyName: string;
  timeRange: TimeRange;
  interval: Interval;
  chartType: ChartType;
  isLoading: boolean;
  error: string | null;
}

// Action types
type ChartAction =
  | { type: 'SET_SYMBOL'; payload: { symbol: string; companyName?: string } }
  | { type: 'SET_TIME_RANGE'; payload: TimeRange }
  | { type: 'SET_INTERVAL'; payload: Interval }
  | { type: 'SET_CHART_TYPE'; payload: ChartType }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: ChartState = {
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  timeRange: '1Y',
  interval: 'D',
  chartType: 'candlestick',
  isLoading: false,
  error: null,
};

// Reducer
function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case 'SET_SYMBOL':
      return {
        ...state,
        symbol: action.payload.symbol,
        companyName: action.payload.companyName || state.companyName,
        error: null,
      };
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.payload };
    case 'SET_INTERVAL':
      return { ...state, interval: action.payload };
    case 'SET_CHART_TYPE':
      return { ...state, chartType: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

// Context interface
interface ChartContextValue {
  state: ChartState;
  setSymbol: (symbol: string, companyName?: string) => void;
  setTimeRange: (range: TimeRange) => void;
  setInterval: (interval: Interval) => void;
  setChartType: (type: ChartType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Create context
const ChartContext = createContext<ChartContextValue | undefined>(undefined);

// Provider component
interface ChartProviderProps {
  children: React.ReactNode;
}

export function ChartProvider({ children }: ChartProviderProps) {
  const [state, dispatch] = useReducer(chartReducer, initialState);

  // Load last symbol from localStorage
  useEffect(() => {
    const savedSymbol = localStorage.getItem('lastSymbol');
    if (savedSymbol) {
      dispatch({ type: 'SET_SYMBOL', payload: { symbol: savedSymbol } });
    }
  }, []);

  // Save symbol to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('lastSymbol', state.symbol);
  }, [state.symbol]);

  const setSymbol = useCallback((symbol: string, companyName?: string) => {
    dispatch({ type: 'SET_SYMBOL', payload: { symbol, companyName } });
  }, []);

  const setTimeRange = useCallback((range: TimeRange) => {
    dispatch({ type: 'SET_TIME_RANGE', payload: range });
  }, []);

  const setInterval = useCallback((interval: Interval) => {
    dispatch({ type: 'SET_INTERVAL', payload: interval });
  }, []);

  const setChartType = useCallback((type: ChartType) => {
    dispatch({ type: 'SET_CHART_TYPE', payload: type });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const value: ChartContextValue = {
    state,
    setSymbol,
    setTimeRange,
    setInterval,
    setChartType,
    setLoading,
    setError,
  };

  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
}

// Hook to use chart context
export function useChartContext() {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChartContext must be used within a ChartProvider');
  }
  return context;
}
