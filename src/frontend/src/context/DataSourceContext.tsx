/**
 * Data Source Context
 * Provides data source state (Mock Data vs Alpha Vantage API) to all components
 * 
 * TASK-003: Data Source Toggle Component
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { DataSource } from '../types';

const STORAGE_KEY = 'financeviz-data-source';

interface DataSourceContextType {
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  isAlphaVantage: boolean;
  isMock: boolean;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

interface DataSourceProviderProps {
  children: ReactNode;
}

/**
 * Data Source Provider Component
 * Manages data source state with localStorage persistence
 */
export function DataSourceProvider({ children }: DataSourceProviderProps) {
  const [dataSource, setDataSourceState] = useState<DataSource>(() => {
    // Initialize from localStorage or default to 'mock'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'alphavantage' || stored === 'mock') {
        return stored;
      }
    }
    return 'mock';
  });

  // Persist to localStorage when data source changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, dataSource);
  }, [dataSource]);

  const setDataSource = (source: DataSource) => {
    setDataSourceState(source);
  };

  const value: DataSourceContextType = {
    dataSource,
    setDataSource,
    isAlphaVantage: dataSource === 'alphavantage',
    isMock: dataSource === 'mock',
  };

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}

/**
 * Hook to access data source context
 */
export function useDataSource(): DataSourceContextType {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error('useDataSource must be used within a DataSourceProvider');
  }
  return context;
}

export default DataSourceContext;
