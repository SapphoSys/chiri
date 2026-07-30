import SortNeutral from 'lucide-react/icons/arrow-down-up';
import SortDesc from 'lucide-react/icons/arrow-down-wide-narrow';
import SortAsc from 'lucide-react/icons/arrow-up-narrow-wide';
import { Tooltip } from '$components/Tooltip';
import type { SortDirection } from '$types/sort';

export const SortDirectionButton = ({
  direction,
  disabled = false,
  disabledLabel = 'Direction unavailable',
  onToggle,
}: {
  direction: SortDirection;
  disabled?: boolean;
  disabledLabel?: string;
  onToggle: () => void;
}) => {
  const directionLabel = direction === 'asc' ? 'Ascending' : 'Descending';
  const buttonClass = `flex size-7 shrink-0 items-center justify-center rounded-md p-1 outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
    disabled
      ? 'text-surface-400 dark:text-surface-600 cursor-not-allowed'
      : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
  }`;

  return (
    <Tooltip
      content={disabled ? disabledLabel : directionLabel}
      position="top"
      allowInModal
      className="whitespace-nowrap"
      triggerClassName="shrink-0"
    >
      <button
        type="button"
        onClick={disabled ? () => {} : onToggle}
        disabled={disabled}
        aria-label={disabled ? disabledLabel : `Sort direction: ${directionLabel}`}
        className={buttonClass}
      >
        {disabled ? (
          <SortNeutral className="h-4 w-4" />
        ) : direction === 'asc' ? (
          <SortAsc className="h-4 w-4" />
        ) : (
          <SortDesc className="h-4 w-4" />
        )}
      </button>
    </Tooltip>
  );
};
