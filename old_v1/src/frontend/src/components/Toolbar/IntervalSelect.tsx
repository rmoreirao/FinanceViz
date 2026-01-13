/**
 * IntervalSelect Component
 * Dropdown for selecting data interval, filtered by time range
 */

import { useMemo } from 'react';
import { useChartContext } from '../../context';
import { Dropdown } from '../common';
import { INTERVALS } from '../../utils';
import { getValidIntervals } from '../../utils/intervals';
import type { Interval } from '../../types';

export function IntervalSelect() {
  const { state, setInterval } = useChartContext();

  // Get valid intervals for the current time range
  const validIntervals = useMemo(
    () => getValidIntervals(state.timeRange),
    [state.timeRange]
  );

  // Filter INTERVALS to only show valid ones
  const options = useMemo(
    () =>
      INTERVALS
        .filter((interval) => validIntervals.includes(interval.value))
        .map((interval) => ({
          label: interval.label,
          value: interval.value,
        })),
    [validIntervals]
  );

  const handleChange = (value: Interval) => {
    setInterval(value);
  };

  return (
    <div className="min-w-[100px]">
      <Dropdown
        options={options}
        value={state.interval}
        onChange={handleChange}
        placeholder="Interval"
      />
    </div>
  );
}
