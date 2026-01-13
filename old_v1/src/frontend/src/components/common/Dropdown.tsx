/**
 * Dropdown Component
 * Accessible dropdown with keyboard navigation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

interface DropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const option = options[highlightedIndex];
            if (!option.disabled) {
              onChange(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => {
              const next = prev + 1;
              return next >= options.length ? 0 : next;
            });
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => {
              const next = prev - 1;
              return next < 0 ? options.length - 1 : next;
            });
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, options, onChange]
  );

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Reset highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const currentIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isOpen, options, value]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-2 text-sm
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-md shadow-sm
          text-gray-900 dark:text-gray-100
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? '' : 'text-gray-500'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className="
            absolute z-50 w-full mt-1
            max-h-60 overflow-auto
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-md shadow-lg
            py-1
          "
        >
          {options.map((option, index) => (
            <li
              key={String(option.value)}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`
                flex items-center justify-between
                px-3 py-2 text-sm cursor-pointer
                ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${highlightedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''}
                ${option.value === value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}
              `}
            >
              <span>{option.label}</span>
              {option.value === value && <Check className="w-4 h-4" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
