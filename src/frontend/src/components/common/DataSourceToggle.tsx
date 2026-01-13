/**
 * Data Source Toggle Component
 * Dropdown to switch between Mock Data and Alpha Vantage API
 * 
 * TASK-003: Data Source Toggle Component
 */

import { useDataSource } from '../../context/DataSourceContext';
import type { DataSource } from '../../types';

interface DataSourceOption {
  value: DataSource;
  label: string;
  description: string;
}

const DATA_SOURCE_OPTIONS: DataSourceOption[] = [
  {
    value: 'mock',
    label: 'Mock Data',
    description: 'Use simulated stock data for development',
  },
  {
    value: 'alphavantage',
    label: 'Alpha Vantage API',
    description: 'Use live data from Alpha Vantage',
  },
];

/**
 * Data Source Toggle Dropdown
 * Allows users to switch between mock data and Alpha Vantage API
 */
export function DataSourceToggle() {
  const { dataSource, setDataSource } = useDataSource();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDataSource(event.target.value as DataSource);
  };

  const currentOption = DATA_SOURCE_OPTIONS.find(opt => opt.value === dataSource);

  return (
    <div className="relative inline-block" data-testid="data-source-toggle">
      <label htmlFor="data-source-select" className="sr-only">
        Data Source
      </label>
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
        <select
          id="data-source-select"
          value={dataSource}
          onChange={handleChange}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors"
          title={currentOption?.description}
        >
          {DATA_SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

export default DataSourceToggle;
