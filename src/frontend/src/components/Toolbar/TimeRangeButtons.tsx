/**
 * Time Range Buttons Component
 * Button group for selecting time range
 * 
 * TASK-011: Time Range Buttons (placeholder implementation)
 */

import { useChart } from '../../context';
import { TIME_RANGES, type TimeRange } from '../../types';

/**
 * Time range button group
 */
export function TimeRangeButtons() {
  const { state, setTimeRange } = useChart();

  return (
    <div className="flex" role="group" aria-label="Time range selection" data-testid="time-range-buttons">
      {TIME_RANGES.map((tr, index) => {
        const isSelected = tr.range === state.timeRange;
        const isFirst = index === 0;
        const isLast = index === TIME_RANGES.length - 1;

        return (
          <button
            key={tr.range}
            type="button"
            onClick={() => setTimeRange(tr.range as TimeRange)}
            className={`px-2 py-1 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 ${
              isFirst ? 'rounded-l-md' : ''
            } ${isLast ? 'rounded-r-md' : ''} ${
              !isFirst ? '-ml-px' : ''
            } ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-pressed={isSelected}
          >
            {tr.label}
          </button>
        );
      })}
    </div>
  );
}

export default TimeRangeButtons;
