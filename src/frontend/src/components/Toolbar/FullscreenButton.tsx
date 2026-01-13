/**
 * Fullscreen Button Component
 * Toggle browser fullscreen mode
 * 
 * TASK-013: Fullscreen Button
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../common';

/**
 * Expand icon for entering fullscreen
 */
function ExpandIcon() {
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
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

/**
 * Compress icon for exiting fullscreen
 */
function CompressIcon() {
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
        d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5"
      />
    </svg>
  );
}

/**
 * Fullscreen button that toggles browser fullscreen API
 * Keyboard shortcut: F key
 */
export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Check if document is currently in fullscreen mode
   */
  const checkFullscreenState = useCallback(() => {
    const fullscreenElement = 
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement;
    
    setIsFullscreen(!!fullscreenElement);
  }, []);

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        const docEl = document.documentElement;
        
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if ((docEl as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (docEl as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        } else if ((docEl as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
          await (docEl as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        } else if ((document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
          await (document as unknown as { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  }, [isFullscreen]);

  /**
   * Handle fullscreen change events
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      checkFullscreenState();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    // Check initial state
    checkFullscreenState();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [checkFullscreenState]);

  /**
   * Keyboard shortcut: F key
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if no input element is focused and F key is pressed
      const target = event.target as HTMLElement;
      const isInputFocused = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (event.key.toLowerCase() === 'f' && !isInputFocused && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleFullscreen]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
    >
      {isFullscreen ? <CompressIcon /> : <ExpandIcon />}
    </Button>
  );
}

export default FullscreenButton;
