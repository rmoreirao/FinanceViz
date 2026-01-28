/**
 * API Key Context
 * Manages Alpha Vantage API key state with localStorage persistence and env fallback
 * 
 * TASK-002-001: Create API Key Context and Storage Utilities
 * TASK-002-005: Integrate API Key Context with Alpha Vantage Client
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { setApiKeyResolver } from '../api/alphavantage';

const STORAGE_KEY = 'alphavantage_api_key';

type ApiKeySource = 'localStorage' | 'env' | 'none';

interface ApiKeyContextType {
  /** Current API key value (null if not configured) */
  apiKey: string | null;
  /** Where the API key was loaded from */
  apiKeySource: ApiKeySource;
  /** Whether an API key is configured */
  isConfigured: boolean;
  /** Save API key to localStorage */
  setApiKey: (key: string) => void;
  /** Remove API key from localStorage */
  clearApiKey: () => void;
  /** Force re-read of API key from storage/env */
  refreshApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

interface ApiKeyProviderProps {
  children: ReactNode;
}

/**
 * Resolve API key from localStorage or environment variable
 * Priority: localStorage > env > null
 */
function resolveApiKey(): { key: string | null; source: ApiKeySource } {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey && storedKey.trim()) {
      return { key: storedKey.trim(), source: 'localStorage' };
    }
  }

  // Fall back to environment variable
  const envKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return { key: envKey.trim(), source: 'env' };
  }

  // No key configured
  return { key: null, source: 'none' };
}

/**
 * API Key Provider Component
 * Manages API key state with localStorage persistence and environment fallback
 */
export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [apiKeySource, setApiKeySource] = useState<ApiKeySource>('none');

  // Initialize API key on mount
  useEffect(() => {
    const { key, source } = resolveApiKey();
    setApiKeyState(key);
    setApiKeySource(source);
  }, []);

  // Set API key resolver for the Alpha Vantage client
  // This allows the API client to get the current key from context
  useEffect(() => {
    setApiKeyResolver(() => apiKey);
  }, [apiKey]);

  /**
   * Save API key to localStorage
   */
  const setApiKey = useCallback((key: string) => {
    const trimmedKey = key.trim();
    if (trimmedKey) {
      localStorage.setItem(STORAGE_KEY, trimmedKey);
      setApiKeyState(trimmedKey);
      setApiKeySource('localStorage');
    }
  }, []);

  /**
   * Remove API key from localStorage
   * After clearing, will fall back to env variable if available
   */
  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const { key, source } = resolveApiKey();
    setApiKeyState(key);
    setApiKeySource(source);
  }, []);

  /**
   * Force re-read of API key from storage/env
   */
  const refreshApiKey = useCallback(() => {
    const { key, source } = resolveApiKey();
    setApiKeyState(key);
    setApiKeySource(source);
  }, []);

  const isConfigured = apiKey !== null && apiKey.length > 0;

  const value: ApiKeyContextType = {
    apiKey,
    apiKeySource,
    isConfigured,
    setApiKey,
    clearApiKey,
    refreshApiKey,
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

/**
 * Get the current API key (for use outside React components)
 * This reads directly from storage/env without context
 */
export function getCurrentApiKey(): string | null {
  const { key } = resolveApiKey();
  return key;
}

export default ApiKeyContext;
