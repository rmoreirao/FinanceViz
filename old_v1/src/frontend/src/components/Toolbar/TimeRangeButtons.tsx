/**
 * TimeRangeButtons Component
 * Button group for selecting time range
 */

import { useChartContext } from '../../context';
import { TIME_RANGES } from '../../utils';
import { getDefaultInterval } from '../../utils/intervals';
import type { TimeRange } from '../../types';

export function TimeRangeButtons() {
  const { state, setTimeRange, setInterval } = useChartContext();

  const handleClick = (range: TimeRange) => {
    setTimeRange(range);
    // Auto-set appropriate interval for the new time range
    const defaultInterval = getDefaultInterval(range);
    setInterval(defaultInterval);
  };

  return (
    <div className="flex items-center rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
      {TIME_RANGES.map((range, index) => (
        <button
          key={range.value}
          onClick={() => handleClick(range.value)}
          className={`
            px-3 py-1.5 text-sm font-medium
            transition-colors duration-150
            focus:outline-none focus:z-10 focus:ring-2 focus:ring-blue-500 focus:ring-inset
            ${
              state.timeRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
            ${index > 0 ? 'border-l border-gray-300 dark:border-gray-600' : ''}
          `}
          aria-pressed={state.timeRange === range.value}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
