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
 * TASK-065: Desktop Layout (≥1024px)
 * TASK-067: Mobile Layout (<768px)
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
      {/* Desktop: ≥1024px - optimal padding and chart dimensions */}
      {/* Tablet: 768-1023px - adjusted padding */}
      {/* Mobile: <768px - full width, minimal padding */}
      <main className="flex-1 p-2 sm:p-3 lg:p-4">
        {/* Chart container with responsive height calculations */}
        {/* Mobile: account for taller toolbar due to hamburger menu */}
        {/* Tablet/Desktop: standard height calculation */}
        <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)] lg:h-[calc(100vh-160px)] min-h-[400px] sm:min-h-[500px]">
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
