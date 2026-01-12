/**
 * ChartTypeSelect Component
 * Dropdown to select chart type with icons
 */

import { useChartContext } from '../../context';
import { Dropdown } from '../common';
import { CHART_TYPES } from '../../utils';
import type { ChartType } from '../../types';

export function ChartTypeSelect() {
  const { state, setChartType } = useChartContext();

  const handleChange = (value: ChartType) => {
    setChartType(value);
  };

  return (
    <div className="min-w-[140px]">
      <Dropdown
        options={CHART_TYPES.map((type) => ({
          label: type.label,
          value: type.value,
        }))}
        value={state.chartType}
        onChange={handleChange}
        placeholder="Chart Type"
      />
    </div>
  );
}
