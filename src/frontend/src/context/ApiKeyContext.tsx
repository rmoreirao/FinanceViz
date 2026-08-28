/**
 * API Key Context
 * Manages Alpha Vantage API key state in memory
 * 
 * TASK-004-001: Create ApiKeyContext and Storage Layer
 */

import { createContext, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'alphaVantageApiKey';

interface ApiKeyContextType {
  apiKey: string | null;
  isLoading: boolean;
  error: string | null;
  validationStatus: 'idle' | 'validating' | 'valid' | 'invalid';
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  testApiKey: (key?: string) => Promise<boolean>;
  hasApiKey: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

/**
 * Remove API keys persisted by earlier versions of the application
 */
function clearLegacyStoredApiKey(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear legacy API key:', error);
  }
}

/**
 * Get API key from the environment
 */
function getEnvironmentApiKey(): string | null {
  const envKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
  return envKey || null;
}

/**
 * Validate API key by making a test request to Alpha Vantage
 */
async function validateApiKey(key: string): Promise<{ valid: boolean; error?: string }> {
  if (!key || key.trim().length === 0) {
    return { valid: false, error: 'API key cannot be empty' };
  }

  // Basic format validation
  if (key.length < 8 || !/^[a-zA-Z0-9]+$/.test(key)) {
    return { valid: false, error: 'Invalid API key format. Must be alphanumeric and at least 8 characters.' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${key}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        return { valid: false, error: 'Rate limit exceeded. Please wait a moment and try again.' };
      }
      return { valid: false, error: `API request failed: ${response.statusText}` };
    }

    const data = await response.json();

    // Check for API error responses
    if (data['Error Message']) {
      return { valid: false, error: 'Invalid API key or symbol not found.' };
    }

    if (data['Note']) {
      return { valid: false, error: 'API rate limit reached. Please wait and try again.' };
    }

    // Check if we got valid quote data
    if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
      return { valid: true };
    }

    return { valid: false, error: 'Unexpected API response format.' };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { valid: false, error: 'Request timeout. Please check your connection and try again.' };
      }
      return { valid: false, error: `Network error: ${error.message}` };
    }
    return { valid: false, error: 'Failed to validate API key. Please try again.' };
  }
}

/**
 * API Key Provider Component
 * Manages API key state in memory and validates it
 */
export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    clearLegacyStoredApiKey();
    return getEnvironmentApiKey();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // Keep user-provided API keys in memory only
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    setError(null);
    setValidationStatus('idle');
  };

  // Clear API key from state
  const clearApiKey = () => {
    setApiKeyState(null);
    setError(null);
    setValidationStatus('idle');
  };

  // Test API key validity
  const testApiKey = async (keyToTest?: string): Promise<boolean> => {
    const testKey = keyToTest || apiKey;
    if (!testKey) {
      setError('No API key to test');
      return false;
    }

    setIsLoading(true);
    setValidationStatus('validating');
    setError(null);

    try {
      const result = await validateApiKey(testKey);
      
      if (result.valid) {
        setValidationStatus('valid');
        setError(null);
        return true;
      } else {
        setValidationStatus('invalid');
        setError(result.error || 'API key validation failed');
        return false;
      }
    } catch (err) {
      setValidationStatus('invalid');
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ApiKeyContextType = {
    apiKey,
    isLoading,
    error,
    validationStatus,
    setApiKey,
    clearApiKey,
    testApiKey,
    hasApiKey: apiKey !== null,
  };

  return (
    <ApiKeyContext.Provider value={value}>
      {children}
    </ApiKeyContext.Provider>
  );
}

/**
 * Hook to access API key context
 */
export function useApiKey(): ApiKeyContextType {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
}

export default ApiKeyContext;
