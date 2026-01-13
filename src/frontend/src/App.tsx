/**
 * App Component
 * Main application entry point for FinanceViz
 * 
 * TASK-001: Project Initialization
 * TASK-003: Data Source Toggle Component
 * TASK-005: Theme Context & Provider
 * TASK-006: Chart Context & State Management
 * TASK-008: Main Toolbar Container
 * TASK-016: Chart Container Component
 */

import { ThemeProvider, DataSourceProvider, ChartProvider, IndicatorProvider } from './context';
import { Toolbar } from './components/Toolbar';
import { QuoteHeader } from './components/QuoteHeader';
import { Chart } from './components/Chart';

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Toolbar */}
      <Toolbar />
      
      {/* Quote Header */}
      <QuoteHeader />
      
      {/* Main Content Area - Chart */}
      <main className="flex-1 p-4">
        <div className="h-[calc(100vh-180px)] min-h-[500px]">
          <Chart />
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
          <IndicatorProvider>
            <AppContent />
          </IndicatorProvider>
        </ChartProvider>
      </DataSourceProvider>
    </ThemeProvider>
  );
}

export default App;
