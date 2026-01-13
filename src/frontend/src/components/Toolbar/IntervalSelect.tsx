/**
 * Interval Selector Component
 * Dropdown for selecting data interval
 * 
 * TASK-012: Interval Selector (placeholder implementation)
 */

import { useChart } from '../../context';
import { INTERVALS, TIME_RANGE_INTERVALS, type Interval } from '../../types';

/**
 * Interval selector dropdown
 */
export function IntervalSelect() {
  const { state, setInterval } = useChart();

  // Get valid intervals for current time range
  const validIntervals = TIME_RANGE_INTERVALS[state.timeRange];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInterval(e.target.value as Interval);
  };

  return (
    <div className="relative" data-testid="interval-select">
      <select
        value={state.interval}
        onChange={handleChange}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Select interval"
      >
        {INTERVALS.map((interval) => {
          const isValid = validIntervals.includes(interval.interval);
          return (
            <option
              key={interval.interval}
              value={interval.interval}
              disabled={!isValid}
              className={!isValid ? 'text-gray-400' : ''}
            >
              {interval.label}
            </option>
          );
        })}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export default IntervalSelect;
