import Calendar from 'lucide-react/icons/calendar';
import ChevronRight from 'lucide-react/icons/chevron-right';
import Cloud from 'lucide-react/icons/cloud';
import { useState } from 'react';
import { MoveToCalendarModal } from '$components/modals/MoveToCalendar/MoveToCalendarModal';
import { getIconByName } from '$constants/icons';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { Account } from '$types/account';

interface DestinationStepProps {
  accounts: Account[];
  selectedAccountId: string;
  selectedCalendarId: string;
  onSelect: (accountId: string, calendarId: string) => void;
}

export const DestinationStep = ({
  accounts,
  selectedAccountId,
  selectedCalendarId,
  onSelect,
}: DestinationStepProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const resolveAccent = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();
  const selectedCalendar = accounts
    .flatMap((account) => account.calendars.map((calendar) => ({ account, calendar })))
    .find(
      ({ account, calendar }) =>
        account.id === selectedAccountId && calendar.id === selectedCalendarId,
    );
  const hasCalendars = accounts.some((account) => account.calendars.length > 0);

  if (accounts.length === 0) {
    return (
      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-surface-600 dark:bg-surface-700/50 dark:text-surface-400">
        <Cloud className="mx-auto mb-2 h-8 w-8 text-surface-400" />
        <p className="font-medium text-surface-600 dark:text-surface-300">No accounts configured</p>
        <p className="mt-1 text-xs">Add a CalDAV account first to import tasks.</p>
      </div>
    );
  }

  if (!hasCalendars) {
    return (
      <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-center text-sm text-surface-500 dark:border-surface-600 dark:bg-surface-700/50 dark:text-surface-400">
        <Calendar className="mx-auto mb-2 h-8 w-8 text-surface-400" />
        <p className="font-medium text-surface-600 dark:text-surface-300">No calendars available</p>
        <p className="mt-1 text-xs">Your accounts don't have any task lists yet.</p>
      </div>
    );
  }

  const selectedCalendarColor = selectedCalendar?.calendar.color
    ? resolveAccent(selectedCalendar.calendar.color)
    : resolvedAccentColor;
  const SelectedCalendarIcon = selectedCalendar
    ? getIconByName(selectedCalendar.calendar.icon || 'calendar')
    : Calendar;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="font-medium text-sm text-surface-800 dark:text-surface-200">Import to</p>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Choose where to add the imported tasks.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsPickerOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg border border-transparent bg-surface-50 p-3 text-left outline-hidden transition-colors hover:border-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink dark:bg-surface-700/50 dark:hover:border-surface-600"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-200 dark:bg-surface-700">
          {selectedCalendar?.calendar.emoji ? (
            <span className="text-base leading-none">{selectedCalendar.calendar.emoji}</span>
          ) : (
            <SelectedCalendarIcon
              className="h-5 w-5"
              style={selectedCalendar ? { color: selectedCalendarColor } : undefined}
            />
          )}
        </div>
        <span className="min-w-0 flex-1">
          {selectedCalendar ? (
            <>
              <span className="block truncate font-medium text-sm text-surface-800 dark:text-surface-200">
                {selectedCalendar.calendar.displayName}
              </span>
              <span className="block truncate text-sm text-surface-500 dark:text-surface-400">
                {selectedCalendar.account.name}
              </span>
            </>
          ) : (
            <span className="text-sm text-surface-500 dark:text-surface-400">
              Select a calendar...
            </span>
          )}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-surface-400" />
      </button>

      {isPickerOpen && (
        <MoveToCalendarModal
          accounts={accounts}
          title="Choose import destination"
          description="Select the calendar for the imported tasks."
          zIndex="z-70"
          onMove={(calendarId) => {
            const account = accounts.find((candidate) =>
              candidate.calendars.some((calendar) => calendar.id === calendarId),
            );
            if (account) onSelect(account.id, calendarId);
            setIsPickerOpen(false);
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
};
