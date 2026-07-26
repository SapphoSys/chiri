import RefreshCw from 'lucide-react/icons/refresh-cw';
import type { MouseEvent } from 'react';
import type { DateFormat } from '$types/settings/categories/region';
import { rruleToDisplaySummary, rruleToText } from '$utils/recurrence';

export const TaskItemRepeatBadge = ({
  rrule,
  repeatFrom,
  dateFormat,
  onClick,
}: {
  rrule: string;
  repeatFrom?: number;
  dateFormat?: DateFormat;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}) => {
  const fullSummary = rruleToText(rrule, repeatFrom, dateFormat);
  const { short } = rruleToDisplaySummary(rrule, repeatFrom, dateFormat);

  const className =
    'inline-flex max-w-36 items-center gap-1 rounded-sm border border-surface-300 bg-surface-50 px-2 py-0.5 font-medium text-surface-600 text-xs dark:border-surface-600 dark:bg-surface-800 dark:text-surface-400';
  const content = (
    <>
      <RefreshCw className="h-3 w-3 shrink-0" />
      <span className="truncate">{short}</span>
    </>
  );

  if (!onClick) {
    return (
      <span title={`Repeat: ${fullSummary}`} className={className}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      title={`Repeat: ${fullSummary}`}
      aria-label={`Edit repeat rule: ${fullSummary}`}
      className={`${className} outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:hover:bg-surface-700`}
    >
      {content}
    </button>
  );
};
