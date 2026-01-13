/**
 * Chart Context & State Management
 * Manages chart state using useReducer pattern
 * 
 * TASK-006: Chart Context & State Management
 */

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { ChartType, TimeRange, Interval, ChartState, ChartAction } from '../types';
import { DEFAULT_INTERVALS } from '../types';

/**
 * Initial chart state
 */
const initialState: ChartState = {
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  timeRange: '1D',
  interval: '5min',
  chartType: 'candlestick',
  isLoading: false,
  error: null,
  dataSource: 'mock',
};

/**
 * Chart reducer function
 */
function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case 'SET_SYMBOL':
      return {
        ...state,
        symbol: action.payload.symbol,
        companyName: action.payload.companyName,
        error: null,
      };
    case 'SET_TIME_RANGE': {
      // Update interval to default for new time range
      const newInterval = DEFAULT_INTERVALS[action.payload];
      return {
        ...state,
        timeRange: action.payload,
        interval: newInterval,
        error: null,
      };
    }
    case 'SET_INTERVAL':
      return {
        ...state,
        interval: action.payload,
        error: null,
      };
    case 'SET_CHART_TYPE':
      return {
        ...state,
        chartType: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'SET_DATA_SOURCE':
      return {
        ...state,
        dataSource: action.payload,
      };
    default:
      return state;
  }
}

/**
 * Chart context type
 */
interface ChartContextType {
  state: ChartState;
  dispatch: React.Dispatch<ChartAction>;
  // Convenience methods
  setSymbol: (symbol: string, companyName: string) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  setInterval: (interval: Interval) => void;
  setChartType: (chartType: ChartType) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const ChartContext = createContext<ChartContextType | undefined>(undefined);

interface ChartProviderProps {
  children: ReactNode;
}

/**
 * Chart Provider Component
 * Provides chart state and actions to all children
 */
export function ChartProvider({ children }: ChartProviderProps) {
  const [state, dispatch] = useReducer(chartReducer, initialState);

  // Convenience action creators
  const setSymbol = (symbol: string, companyName: string) => {
    dispatch({ type: 'SET_SYMBOL', payload: { symbol, companyName } });
  };

  const setTimeRange = (timeRange: TimeRange) => {
    dispatch({ type: 'SET_TIME_RANGE', payload: timeRange });
  };

  const setInterval = (interval: Interval) => {
    dispatch({ type: 'SET_INTERVAL', payload: interval });
  };

  const setChartType = (chartType: ChartType) => {
    dispatch({ type: 'SET_CHART_TYPE', payload: chartType });
  };

  const setLoading = (isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value: ChartContextType = {
    state,
    dispatch,
    setSymbol,
    setTimeRange,
    setInterval,
    setChartType,
    setLoading,
    setError,
  };

  return (
    <ChartContext.Provider value={value}>
      {children}
    </ChartContext.Provider>
  );
}

/**
 * Hook to access chart context
 */
export function useChart(): ChartContextType {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChart must be used within a ChartProvider');
  }
  return context;
}

export default ChartContext;
