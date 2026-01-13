/**
 * useChartResize Hook
 * Handles responsive chart resizing
 * 
 * TASK-016: Chart Container Component
 */

import { useState, useEffect, useCallback, type RefObject } from 'react';

interface ChartDimensions {
  width: number;
  height: number;
}

/**
 * Hook to track container dimensions and handle resize
 * Uses ResizeObserver for efficient dimension tracking
 */
export function useChartResize(
  containerRef: RefObject<HTMLDivElement | null>
): ChartDimensions {
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 0,
    height: 0,
  });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    }
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial measurement
    updateDimensions();

    // Use ResizeObserver for efficient resize tracking
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.floor(width),
          height: Math.floor(height),
        });
      }
    });

    resizeObserver.observe(container);

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [containerRef, updateDimensions]);

  return dimensions;
}

export default useChartResize;
