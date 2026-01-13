/**
 * API Cache Module
 * In-memory cache with TTL for API responses
 * 
 * TASK-094: API Error Handling & Caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  /** Default TTL in milliseconds */
  defaultTTL: number;
  /** Maximum number of entries */
  maxEntries: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxEntries: 100,
};

/**
 * TTL values for different data types (in milliseconds)
 */
export const CACHE_TTL = {
  /** Quote data - refresh frequently */
  QUOTE: 60 * 1000, // 1 minute
  /** Intraday data - moderate refresh */
  INTRADAY: 60 * 1000, // 1 minute
  /** Daily data - longer cache */
  DAILY: 5 * 60 * 1000, // 5 minutes
  /** Weekly/Monthly data - long cache */
  HISTORICAL: 15 * 60 * 1000, // 15 minutes
  /** Symbol search - long cache */
  SYMBOL_SEARCH: 30 * 60 * 1000, // 30 minutes
};

/**
 * Simple in-memory cache implementation
 */
class APICache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix: string, ...params: (string | number | undefined)[]): string {
    return `${prefix}:${params.filter(Boolean).join(':')}`;
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL): void {
    // Enforce max entries limit
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Evict oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

/**
 * Singleton cache instance for API data
 */
export const apiCache = new APICache();

/**
 * Wrapper for cached API calls
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache the result
  apiCache.set(key, data, ttl);

  return data;
}

/**
 * Retry logic for failed requests
 */
export async function withRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      const apiError = error as { type?: string };
      if (apiError.type === 'INVALID_API_KEY' || apiError.type === 'INVALID_SYMBOL') {
        throw error;
      }

      // Wait before retrying (with exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

/**
 * User-friendly error messages
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const apiError = error as { type?: string; message?: string };

  switch (apiError.type) {
    case 'RATE_LIMIT':
      return 'API rate limit reached. Please wait a moment before trying again.';
    case 'INVALID_API_KEY':
      return 'Invalid API key. Please check your configuration.';
    case 'INVALID_SYMBOL':
      return 'Invalid stock symbol. Please try a different symbol.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your internet connection.';
    default:
      return apiError.message || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Create an offline error
 */
export function createOfflineError(): Error {
  const error = new Error('You appear to be offline. Please check your internet connection.');
  (error as { type?: string }).type = 'NETWORK_ERROR';
  return error;
}

export default apiCache;
