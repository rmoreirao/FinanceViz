/**
 * App Component
 * Main application layout with context providers
 * 
 * TASK-092: Create App component layout
 * TASK-093: Set default symbol on load (handled in ChartContext)
 * TASK-094: Implement keyboard shortcuts
 */

import { useEffect, useCallback } from 'react';
import { ChartProvider, IndicatorProvider, ThemeProvider } from './context';
import { QuoteHeader } from './components/QuoteHeader';
import { Toolbar } from './components/Toolbar';
import { Chart } from './components/Chart';
import { ErrorBoundary } from './components/common';
import './App.css';

/**
 * KeyboardShortcuts Component
 * Handles global keyboard shortcuts for chart interaction
 * 
 * Shortcuts:
 * - +/= : Zoom in
 * - - : Zoom out
 * - ArrowLeft : Pan left
 * - ArrowRight : Pan right
 * - R : Reset zoom/pan
 * - F : Toggle fullscreen
 * - / : Focus search
 */
function KeyboardShortcuts() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    switch (e.key) {
      case '+':
      case '=':
        // Zoom in - dispatch custom event for chart to handle
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('chart:zoom', { detail: { direction: 'in' } }));
        break;

      case '-':
        // Zoom out
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('chart:zoom', { detail: { direction: 'out' } }));
        break;

      case 'ArrowLeft':
        // Pan left
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('chart:pan', { detail: { direction: 'left' } }));
        break;

      case 'ArrowRight':
        // Pan right
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('chart:pan', { detail: { direction: 'right' } }));
        break;

      case 'r':
      case 'R':
        // Reset zoom/pan
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('chart:reset'));
        break;

      case 'f':
      case 'F':
        // Toggle fullscreen
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;

      case '/':
        // Focus search
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null;
}

/**
 * AppContent Component
 * The main app content that uses contexts
 */
function AppContent() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts />

      {/* Quote Header - Symbol, price, and change */}
      <QuoteHeader />

      {/* Toolbar - Search, chart type, time range, interval */}
      <Toolbar />

      {/* Chart - Main chart area with volume and indicators */}
      <div className="flex-1 min-h-0">
        <Chart />
      </div>
    </div>
  );
}

/**
 * App Component
 * Root component with all context providers and error boundary
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ChartProvider>
          <IndicatorProvider>
            <AppContent />
          </IndicatorProvider>
        </ChartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

