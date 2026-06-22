/**
 * API Key Modal Component
 * Initial setup modal for configuring Alpha Vantage API key
 * 
 * TASK-004-003: Create API Key Input Modal Component
 */

import { useState } from 'react';
import { Modal, Button, Spinner } from '../common';
import { useApiKey } from '../../context';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  allowSkip?: boolean;
}

/**
 * Modal for API key input and validation
 */
export function ApiKeyModal({ isOpen, onClose, allowSkip = false }: ApiKeyModalProps) {
  const { setApiKey, testApiKey, isLoading, error, validationStatus } = useApiKey();
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!inputValue.trim()) {
      setLocalError('Please enter an API key');
      return;
    }

    setLocalError(null);
    await testApiKey(inputValue);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setLocalError('Please enter an API key');
      return;
    }

    // Test the key first if not already validated
    if (validationStatus !== 'valid') {
      const isValid = await testApiKey(inputValue);
      if (!isValid) {
        return;
      }
    }

    // Save the key
    setApiKey(inputValue);
    setInputValue('');
    setLocalError(null);
    onClose();
  };

  const handleSkip = () => {
    setInputValue('');
    setLocalError(null);
    onClose();
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setLocalError(null);
  };

  const displayError = localError || error;
  const isSaveDisabled = !inputValue.trim() || isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={allowSkip ? handleSkip : () => {}}
      title="Configure API Key"
      size="md"
      closeOnOverlayClick={allowSkip}
      closeOnEscape={allowSkip}
      showCloseButton={allowSkip}
    >
      <div className="space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your Alpha Vantage API key to access real-time market data.
          {' '}
          <a
            href="https://www.alphavantage.co/support/#api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Get a free API key
          </a>
        </p>

        {/* Input Field */}
        <div>
          <label
            htmlFor="api-key-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 
                         rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSaveDisabled) {
                  handleSave();
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs
                         text-gray-600 dark:text-gray-400 hover:text-gray-900 
                         dark:hover:text-gray-200 focus:outline-none"
              disabled={isLoading}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Validation Status */}
        {validationStatus === 'validating' && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Spinner size="sm" />
            <span>Validating API key...</span>
          </div>
        )}

        {validationStatus === 'valid' && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>API key is valid!</span>
          </div>
        )}

        {validationStatus === 'invalid' && displayError && (
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{displayError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleTest}
            variant="secondary"
            disabled={!inputValue.trim() || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                <span>Testing...</span>
              </>
            ) : (
              'Test Key'
            )}
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            disabled={isSaveDisabled}
            className="flex-1"
          >
            Save
          </Button>
        </div>

        {allowSkip && (
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="w-full"
          >
            Skip for now
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default ApiKeyModal;
