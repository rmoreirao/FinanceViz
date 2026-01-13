/**
 * ChartSkeleton Component
 * Animated placeholder displayed while chart data is loading
 */

export function ChartSkeleton() {
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 animate-pulse">
      {/* Main chart area skeleton */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Legend skeleton */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Chart grid skeleton */}
        <div className="flex-1 relative">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-px bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>

          {/* Fake candlesticks */}
          <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
            {[...Array(20)].map((_, i) => {
              const height = 20 + Math.random() * 60;
              const isGreen = Math.random() > 0.5;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1"
                  style={{ height: `${height}%` }}
                >
                  {/* Wick */}
                  <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />
                  {/* Body */}
                  <div
                    className={`w-2 rounded-sm ${
                      isGreen
                        ? 'bg-green-200 dark:bg-green-900/50'
                        : 'bg-red-200 dark:bg-red-900/50'
                    }`}
                    style={{ height: `${30 + Math.random() * 40}%` }}
                  />
                  {/* Lower wick */}
                  <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="absolute right-0 inset-y-0 flex flex-col justify-between py-4 pl-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Volume pane skeleton */}
      <div className="h-24 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end justify-around h-full gap-1">
          {[...Array(20)].map((_, i) => {
            const height = 20 + Math.random() * 80;
            return (
              <div
                key={i}
                className="w-2 bg-gray-200 dark:bg-gray-700 rounded-t"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="h-8 flex items-center justify-around px-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"
          />
        ))}
      </div>
    </div>
  );
}
