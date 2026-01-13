/**
 * Spinner Component
 * Loading spinner with configurable size
 * 
 * TASK-007: Common UI Components
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

/**
 * Spinner component with configurable size
 */
export function Spinner({ size = 'md', className = '', color }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color || 'currentColor'}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color || 'currentColor'}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Full page loading spinner
 */
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <Spinner size="xl" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

export default Spinner;
