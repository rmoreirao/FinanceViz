/**
 * App Component
 * Main application entry point for FinanceViz
 * 
 * TASK-001: Project Initialization
 * TASK-003: Data Source Toggle Component
 * TASK-005: Theme Context & Provider
 * TASK-006: Chart Context & State Management
 * TASK-008: Main Toolbar Container
 */

import { ThemeProvider, DataSourceProvider, ChartProvider, useChart } from './context';
import { Toolbar } from './components/Toolbar';
import { QuoteHeader } from './components/QuoteHeader';

function AppContent() {
  const { state } = useChart();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Toolbar */}
      <Toolbar />
      
      {/* Quote Header */}
      <QuoteHeader />
      
      {/* Main Content Area */}
      <main className="flex-1 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
          {/* Chart Info Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {state.symbol} - {state.companyName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {state.chartType} chart • {state.timeRange} • {state.interval}
            </p>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-96 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p className="text-lg font-medium">Chart Component</p>
              <p className="text-sm">Will be implemented in Phase 3</p>
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-500 dark:text-gray-400 font-mono">
            <p>State: symbol={state.symbol}, chartType={state.chartType}, timeRange={state.timeRange}, interval={state.interval}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DataSourceProvider>
        <ChartProvider>
          <AppContent />
        </ChartProvider>
      </DataSourceProvider>
    </ThemeProvider>
  );
}

export default App;
