/**
 * Dropdown Component
 * Reusable dropdown with optional search functionality
 * 
 * TASK-007: Common UI Components
 */

import { useState, useRef, useEffect, type ReactNode } from 'react';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  renderOption?: (option: DropdownOption<T>, isSelected: boolean) => ReactNode;
  renderValue?: (option: DropdownOption<T> | undefined) => ReactNode;
}

/**
 * Dropdown component with optional search
 */
export function Dropdown<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  searchPlaceholder = 'Search...',
  className = '',
  buttonClassName = '',
  disabled = false,
  renderOption,
  renderValue,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search
  const filteredOptions = searchable
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex] && !filteredOptions[highlightedIndex].disabled) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
    }
  };

  const handleOptionClick = (option: DropdownOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] ${buttonClassName}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 truncate">
          {renderValue ? (
            renderValue(selectedOption)
          ) : (
            <>
              {selectedOption?.icon}
              {selectedOption?.label ?? placeholder}
            </>
          )}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <ul className="overflow-y-auto max-h-48" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={String(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleOptionClick(option)}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${
                      option.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : isHighlighted
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <>
                        {option.icon}
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {option.description}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <svg
                            className="w-4 h-4 ml-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
