import Check from 'lucide-react/icons/check';
import { getIconByName } from '$constants/icons';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { Account } from '$types/account';

interface CalendarOptionProps {
  cal: Account['calendars'][number];
  isSelected?: boolean;
  onSelect: () => void;
}

const calendarOptionButtonClass =
  "relative w-full text-sm rounded-lg transition-colors outline-hidden before:content-[''] before:pointer-events-none before:absolute before:inset-y-0 before:left-1.5 before:right-1.5 before:rounded-lg before:transition-colors hover:before:bg-surface-100 dark:hover:before:bg-surface-700 focus-visible:before:ring-2 focus-visible:before:ring-primary-ink focus-visible:before:ring-inset";
const calendarOptionContentClass = 'relative z-10 flex items-center gap-3 px-3 py-2.5';

export const CalendarOption = ({ cal, isSelected = false, onSelect }: CalendarOptionProps) => {
  const resolveAccent = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();
  const CalIcon = getIconByName(cal.icon || 'calendar');
  const calendarColor = cal.color ? resolveAccent(cal.color) : resolvedAccentColor;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`${calendarOptionButtonClass} ${
        isSelected ? 'before:bg-surface-200 dark:before:bg-surface-700' : ''
      }`}
    >
      <span className={calendarOptionContentClass}>
        {cal.emoji ? (
          <span className="text-base leading-none">{cal.emoji}</span>
        ) : (
          <CalIcon className="h-4 w-4 shrink-0" style={{ color: calendarColor }} />
        )}
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate font-medium text-surface-700 dark:text-surface-300">
            {cal.displayName || 'Calendar'}
          </div>
        </div>
        {isSelected && <Check className="h-4 w-4 shrink-0 text-primary-ink" />}
      </span>
    </button>
  );
};
