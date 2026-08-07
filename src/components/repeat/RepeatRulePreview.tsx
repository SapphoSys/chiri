import ChevronRight from 'lucide-react/icons/chevron-right';
import RefreshCw from 'lucide-react/icons/refresh-cw';
import { useSettingsStore } from '$context/settingsContext';
import { getNextOccurrence, rruleToDisplaySummary, rruleToText } from '$lib/task/recurrence';
import { formatDate } from '$utils/date';

interface RepeatRulePreviewProps {
  rrule: string;
  repeatFrom: number;
  dueDate?: Date;
  onOpen: () => void;
  labelId?: string;
  readOnly?: boolean;
  surface?: 'default' | 'nested';
}

export const RepeatRulePreview = ({
  rrule,
  repeatFrom,
  dueDate,
  onOpen,
  labelId,
  readOnly = false,
  surface = 'default',
}: RepeatRulePreviewProps) => {
  const { dateFormat } = useSettingsStore();
  const summary = rruleToDisplaySummary(rrule, repeatFrom, dateFormat);
  const fullSummary = rruleToText(rrule, repeatFrom, dateFormat);
  const followingOccurrence =
    dueDate && repeatFrom !== 1 ? getNextOccurrence(rrule, dueDate, dueDate) : null;
  const visibleDetails = summary.details.filter((detail) => detail !== 'from due date');

  return (
    <div
      className={`group flex items-stretch overflow-hidden rounded-lg border border-transparent transition-colors hover:border-surface-300 dark:hover:border-surface-500 ${surface === 'nested' ? 'bg-surface-50 dark:bg-surface-700/50' : 'bg-surface-100 dark:bg-surface-800'}`}
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={readOnly}
        aria-labelledby={labelId}
        title={`Repeat: ${fullSummary}`}
        className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${readOnly ? 'cursor-not-allowed' : ''}`}
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-200 text-surface-500 dark:bg-surface-700 dark:text-surface-300">
          <RefreshCw className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-sm text-surface-800 dark:text-surface-100">
            {summary.primary}
          </span>
          {visibleDetails.length > 0 && (
            <span className="mt-0.5 block whitespace-nowrap text-surface-500 text-xs leading-snug group-hover:truncate dark:text-surface-400">
              {visibleDetails.join(' · ')}
            </span>
          )}
          {followingOccurrence ? (
            <span className="mt-0.5 block whitespace-nowrap text-surface-400 text-xs leading-snug group-hover:truncate dark:text-surface-500">
              Then: {formatDate(followingOccurrence, true, dateFormat)}
            </span>
          ) : repeatFrom === 1 ? (
            <span className="mt-0.5 block whitespace-nowrap text-surface-400 text-xs leading-snug group-hover:truncate dark:text-surface-500">
              Next date depends on completion
            </span>
          ) : !dueDate ? (
            <span className="mt-0.5 block whitespace-nowrap text-surface-400 text-xs leading-snug group-hover:truncate dark:text-surface-500">
              First date is set when the task completes
            </span>
          ) : null}
        </span>
        {!readOnly && (
          <ChevronRight className="h-4 w-4 shrink-0 text-surface-400 opacity-0 group-hover:opacity-100" />
        )}
      </button>
    </div>
  );
};
