import CalendarCheck from 'lucide-react/icons/calendar-check';
import CalendarDays from 'lucide-react/icons/calendar-days';
import CalendarHeart from 'lucide-react/icons/calendar-heart';
import CalendarRange from 'lucide-react/icons/calendar-range';
import ChevronRight from 'lucide-react/icons/chevron-right';
import SlidersHorizontal from 'lucide-react/icons/sliders-horizontal';
import Sun from 'lucide-react/icons/sun';
import { useSettingsStore } from '$context/settingsContext';
import { getNextOccurrence, rruleToDisplaySummary, rruleToText } from '$lib/task/recurrence';
import type { LucideIcon } from '$types/lucide';
import { formatDate } from '$utils/date';

const REPEAT_PREVIEW_ICONS: Record<string, LucideIcon> = {
  Daily: Sun,
  Weekdays: CalendarCheck,
  Weekly: CalendarDays,
  Monthly: CalendarRange,
  Yearly: CalendarHeart,
};

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
  const { dateFormat, workingDays } = useSettingsStore();
  const summary = rruleToDisplaySummary(rrule, repeatFrom, dateFormat, workingDays);
  const fullSummary = rruleToText(rrule, repeatFrom, dateFormat, workingDays);
  const RepeatIcon = REPEAT_PREVIEW_ICONS[summary.primary] ?? SlidersHorizontal;
  const followingOccurrence =
    dueDate && repeatFrom !== 1 ? getNextOccurrence(rrule, dueDate, dueDate) : null;
  const visibleDetails = summary.details.filter(
    (detail) => detail !== 'from due date' && detail !== 'from completion',
  );

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
        className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left outline-hidden focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${readOnly ? 'cursor-not-allowed' : ''}`}
      >
        <RepeatIcon className="h-5 w-5 shrink-0 text-surface-500 dark:text-surface-300" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-sm text-surface-800 dark:text-surface-100">
            {summary.primary}
          </span>
          {visibleDetails.length > 0 && (
            <span className="block whitespace-nowrap text-surface-500 text-xs group-hover:truncate dark:text-surface-400">
              {visibleDetails.join(' · ')}
            </span>
          )}
          {followingOccurrence ? (
            <span className="block whitespace-nowrap text-surface-500 text-xs group-hover:truncate dark:text-surface-400">
              Then: {formatDate(followingOccurrence, true, dateFormat)}
            </span>
          ) : repeatFrom === 1 ? (
            <span className="block whitespace-nowrap text-surface-500 text-xs group-hover:truncate dark:text-surface-400">
              Next date depends on completion
            </span>
          ) : !dueDate ? (
            <span className="block whitespace-nowrap text-surface-500 text-xs group-hover:truncate dark:text-surface-400">
              First date is set when the task completes
            </span>
          ) : null}
        </span>
        {!readOnly && (
          <ChevronRight className="h-4 w-4 shrink-0 text-surface-500 opacity-0 group-hover:opacity-100 dark:text-surface-400" />
        )}
      </button>
    </div>
  );
};
