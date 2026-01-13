/**
 * Indicators Panel Component
 * Searchable panel for adding indicators with collapsible categories
 *
 * TASK-057: Indicators Panel UI
 */

import { useState, useMemo, useCallback } from 'react';
import { Modal } from '../common';
import { useIndicators } from '../../context/IndicatorContext';
import type { OverlayIndicatorType, OscillatorIndicatorType } from '../../types/indicators';

/**
 * Indicator definition
 */
interface IndicatorDefinition {
  type: OverlayIndicatorType | OscillatorIndicatorType;
  name: string;
  description: string;
  category: 'overlay' | 'oscillator';
}

/**
 * Category definition
 */
interface CategoryDefinition {
  id: string;
  name: string;
  icon: string;
  indicators: IndicatorDefinition[];
}

/**
 * All available indicators organized by category
 */
const INDICATOR_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'trend',
    name: 'Trend (Overlay)',
    icon: '📈',
    indicators: [
      { type: 'sma', name: 'SMA', description: 'Simple Moving Average', category: 'overlay' },
      { type: 'ema', name: 'EMA', description: 'Exponential Moving Average', category: 'overlay' },
      { type: 'wma', name: 'WMA', description: 'Weighted Moving Average', category: 'overlay' },
      { type: 'dema', name: 'DEMA', description: 'Double Exponential Moving Average', category: 'overlay' },
      { type: 'tema', name: 'TEMA', description: 'Triple Exponential Moving Average', category: 'overlay' },
      { type: 'vwap', name: 'VWAP', description: 'Volume Weighted Average Price', category: 'overlay' },
      { type: 'bollingerBands', name: 'Bollinger Bands', description: 'Volatility bands around SMA', category: 'overlay' },
      { type: 'envelope', name: 'Envelope', description: 'Moving average envelope', category: 'overlay' },
      { type: 'parabolicSar', name: 'Parabolic SAR', description: 'Stop and Reverse indicator', category: 'overlay' },
      { type: 'ichimoku', name: 'Ichimoku Cloud', description: 'Ichimoku Kinko Hyo', category: 'overlay' },
    ],
  },
  {
    id: 'momentum',
    name: 'Momentum (Oscillator)',
    icon: '⚡',
    indicators: [
      { type: 'rsi', name: 'RSI', description: 'Relative Strength Index', category: 'oscillator' },
      { type: 'macd', name: 'MACD', description: 'Moving Average Convergence Divergence', category: 'oscillator' },
      { type: 'stochastic', name: 'Stochastic', description: 'Stochastic Oscillator', category: 'oscillator' },
      { type: 'stochasticRsi', name: 'Stochastic RSI', description: 'Stochastic RSI', category: 'oscillator' },
      { type: 'williamsR', name: 'Williams %R', description: 'Williams Percent Range', category: 'oscillator' },
      { type: 'cci', name: 'CCI', description: 'Commodity Channel Index', category: 'oscillator' },
      { type: 'atr', name: 'ATR', description: 'Average True Range', category: 'oscillator' },
      { type: 'adx', name: 'ADX', description: 'Average Directional Index', category: 'oscillator' },
      { type: 'roc', name: 'ROC', description: 'Rate of Change', category: 'oscillator' },
      { type: 'momentum', name: 'Momentum', description: 'Momentum Oscillator', category: 'oscillator' },
      { type: 'aroon', name: 'Aroon', description: 'Aroon Up/Down', category: 'oscillator' },
      { type: 'awesomeOscillator', name: 'Awesome Oscillator', description: 'AO Histogram', category: 'oscillator' },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    icon: '📊',
    indicators: [
      { type: 'obv', name: 'OBV', description: 'On-Balance Volume', category: 'oscillator' },
      { type: 'cmf', name: 'CMF', description: 'Chaikin Money Flow', category: 'oscillator' },
      { type: 'mfi', name: 'MFI', description: 'Money Flow Index', category: 'oscillator' },
    ],
  },
];

/**
 * Search icon component
 */
function SearchIcon() {
  return (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

/**
 * Chevron icon for expand/collapse
 */
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

/**
 * Plus icon for adding indicator
 */
function PlusIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

interface IndicatorsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Indicators Panel Component
 * Displays a searchable, categorized list of available indicators
 */
export function IndicatorsPanel({ isOpen, onClose }: IndicatorsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(INDICATOR_CATEGORIES.map(c => c.id))
  );
  
  const { addOverlay, addOscillator } = useIndicators();

  /**
   * Toggle category expansion
   */
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  /**
   * Handle adding an indicator
   */
  const handleAddIndicator = useCallback((indicator: IndicatorDefinition) => {
    if (indicator.category === 'overlay') {
      addOverlay(indicator.type as OverlayIndicatorType);
    } else {
      addOscillator(indicator.type as OscillatorIndicatorType);
    }
    onClose();
  }, [addOverlay, addOscillator, onClose]);

  /**
   * Filter categories and indicators based on search query
   */
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return INDICATOR_CATEGORIES;
    }

    const query = searchQuery.toLowerCase();
    return INDICATOR_CATEGORIES.map(category => ({
      ...category,
      indicators: category.indicators.filter(
        indicator =>
          indicator.name.toLowerCase().includes(query) ||
          indicator.description.toLowerCase().includes(query) ||
          indicator.type.toLowerCase().includes(query)
      ),
    })).filter(category => category.indicators.length > 0);
  }, [searchQuery]);

  /**
   * Check if there are any results
   */
  const hasResults = filteredCategories.some(c => c.indicators.length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Indicator"
      size="md"
    >
      <div className="flex flex-col h-[400px]">
        {/* Search Input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search Indicators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors"
            autoFocus
            data-testid="indicator-search-input"
          />
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto" data-testid="indicator-categories">
          {hasResults ? (
            filteredCategories.map(category => (
              <div key={category.id} className="mb-2" data-testid={`indicator-category-${category.id}`}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                             hover:bg-gray-100 dark:hover:bg-gray-700
                             text-gray-700 dark:text-gray-200 font-medium
                             transition-colors"
                  data-testid={`category-toggle-${category.id}`}
                >
                  <ChevronIcon expanded={expandedCategories.has(category.id)} />
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {category.indicators.length}
                  </span>
                </button>

                {/* Indicators List */}
                {expandedCategories.has(category.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {category.indicators.map(indicator => (
                      <button
                        key={indicator.type}
                        onClick={() => handleAddIndicator(indicator)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                                   hover:bg-blue-50 dark:hover:bg-blue-900/30
                                   text-gray-600 dark:text-gray-300
                                   group transition-colors"
                        data-testid={`indicator-item-${indicator.type}`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            {indicator.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {indicator.description}
                          </span>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity
                                        text-blue-500 dark:text-blue-400">
                          <PlusIcon />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
              <p>No indicators found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default IndicatorsPanel;
