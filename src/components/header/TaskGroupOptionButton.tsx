import { Tooltip } from '$components/Tooltip';
import type { TaskGroupMode } from '$types/sort';

export const TaskGroupOptionButton = ({
  option,
  isActive,
  disabled = false,
  disabledReason,
  onClick,
}: {
  option: { value: TaskGroupMode; label: string };
  isActive: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onClick: () => void;
}) => {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
        disabled
          ? 'cursor-not-allowed text-surface-400 dark:text-surface-500'
          : isActive
            ? 'bg-surface-200 text-surface-900 dark:bg-surface-700 dark:text-surface-100'
            : 'text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700'
      }`}
    >
      <span>{option.label}</span>
    </button>
  );

  return disabled && disabledReason ? (
    <Tooltip content={disabledReason} position="top" allowInModal>
      {button}
    </Tooltip>
  ) : (
    button
  );
};
