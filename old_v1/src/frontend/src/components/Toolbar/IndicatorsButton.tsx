/**
 * IndicatorsButton Component
 * Button that opens Indicators Panel with badge showing active count
 */

import { LineChart } from 'lucide-react';
import { useIndicatorContext } from '../../context';
import { Button } from '../common';

interface IndicatorsButtonProps {
  onClick: () => void;
}

export function IndicatorsButton({ onClick }: IndicatorsButtonProps) {
  const { activeCount } = useIndicatorContext();

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="md"
        onClick={onClick}
        aria-label="Open indicators panel"
      >
        <LineChart className="w-4 h-4" />
        <span className="hidden sm:inline">Indicators</span>
      </Button>

      {/* Badge showing count of active indicators */}
      {activeCount > 0 && (
        <span
          className="
            absolute -top-1 -right-1
            flex items-center justify-center
            min-w-[18px] h-[18px]
            px-1 text-xs font-bold
            bg-blue-600 text-white
            rounded-full
          "
        >
          {activeCount}
        </span>
      )}
    </div>
  );
}
