/**
 * useChartResize Hook
 * Tracks container dimensions with debounced updates
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChartDimensions } from '../types';

export function useChartResize(debounceMs: number = 100): {
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: ChartDimensions;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 0,
    height: 0,
  });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, debounceMs);
    };

    // Initial measurement
    updateDimensions();

    // Create ResizeObserver for container
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceMs, updateDimensions]);

  return { containerRef, dimensions };
}
