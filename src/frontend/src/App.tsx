/**
 * App Component
 * Main application entry point for FinanceViz
 * 
 * TASK-001: Project Initialization
 */

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            FinanceViz
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stock Chart Visualization
          </p>
        </div>
      </header>
      
      <main className="p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Welcome to FinanceViz
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This application provides interactive stock chart visualization with technical indicators.
          </p>
          
          {/* TailwindCSS Test Classes */}
          <div className="flex gap-4 mt-6">
            <div className="px-4 py-2 bg-bullish text-white rounded-md font-medium">
              Bullish (+)
            </div>
            <div className="px-4 py-2 bg-bearish text-white rounded-md font-medium">
              Bearish (-)
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            ✓ TailwindCSS is working correctly if you see styled buttons above.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
