import { AccountModal } from '$components/modals/AccountModal/AccountModal';
import { CalendarModal } from '$components/modals/CalendarModal';
import { ExportModal } from '$components/modals/ExportModal';
import { FilterModal } from '$components/modals/FilterModal';
import { FilterPresetModal } from '$components/modals/FilterPresetModal';
import { SidebarMobileConfigExportModal } from '$components/modals/SidebarMobileConfigExportModal';
import { TagModal } from '$components/modals/TagModal';
import { getTasksByCalendar } from '$lib/store/tasks';
import type { Account } from '$types/account';
import type { FilterPresetDefinition } from '$types/filter';
import type { SidebarModals } from '$types/modals';
import type { Task } from '$types/task/model';

export interface SidebarModalOverlaysProps {
  accounts: Account[];
  tasks: Task[];
  modals: SidebarModals;
  existingFilterPresetIds: Set<string>;
  onCreateFilterPreset: (preset: FilterPresetDefinition) => void;
  onConfirmMobileConfigExport: (includePassword: boolean) => void;
}

export const SidebarModalOverlays = ({
  accounts,
  tasks,
  modals,
  existingFilterPresetIds,
  onCreateFilterPreset,
  onConfirmMobileConfigExport,
}: SidebarModalOverlaysProps) => {
  const {
    showAccountModal,
    editingAccountId,
    showTagModal,
    editingTagId,
    showCreateCalendar,
    createCalendarAccountId,
    showCalendarModal,
    editingCalendar,
    showFilterPresetModal,
    editingFilterId,
    exportTarget,
    mobileConfigAccountId,
    closeAccount,
    closeTag,
    closeCreateCalendar,
    closeCalendar,
    closeFilterPreset,
    closeFilter,
    closeExport,
    closeMobileConfigExport,
  } = modals;

  const editingAccount = editingAccountId
    ? (accounts.find((account) => account.id === editingAccountId) ?? null)
    : null;
  const editingCalendarAccount = editingCalendar
    ? accounts.find((account) => account.id === editingCalendar.accountId)
    : undefined;
  const editingCalendarModel = editingCalendarAccount?.calendars.find(
    (calendar) => calendar.id === editingCalendar?.calendarId,
  );

  return (
    <>
      {showFilterPresetModal && (
        <FilterPresetModal
          existingPresetIds={existingFilterPresetIds}
          onCreatePreset={onCreateFilterPreset}
          onClose={closeFilterPreset}
        />
      )}

      {editingFilterId && <FilterModal filterId={editingFilterId} onClose={closeFilter} />}

      {showAccountModal && <AccountModal account={editingAccount} onClose={closeAccount} />}

      {showTagModal && <TagModal tagId={editingTagId} onClose={closeTag} />}

      {showCalendarModal && editingCalendar && editingCalendarModel && (
        <CalendarModal
          calendar={editingCalendarModel}
          accountId={editingCalendar.accountId}
          onClose={closeCalendar}
        />
      )}

      {showCreateCalendar && createCalendarAccountId && (
        <CalendarModal accountId={createCalendarAccountId} onClose={closeCreateCalendar} />
      )}

      {exportTarget?.type === 'calendar' && (
        <ExportModal
          tasks={getTasksByCalendar(exportTarget.calendarId)}
          type="single-calendar"
          calendarName={
            accounts
              .flatMap((account) => account.calendars)
              .find((calendar) => calendar.id === exportTarget.calendarId)?.displayName
          }
          fileName={
            accounts
              .flatMap((account) => account.calendars)
              .find((calendar) => calendar.id === exportTarget.calendarId)
              ?.displayName.replace(/[^a-z0-9]/gi, '-')
              .toLowerCase() ?? 'export'
          }
          onClose={closeExport}
        />
      )}

      {exportTarget?.type === 'account' && (
        <ExportModal
          tasks={tasks.filter((task) => task.accountId === exportTarget.accountId)}
          calendars={
            accounts.find((account) => account.id === exportTarget.accountId)?.calendars ?? []
          }
          type="all-calendars"
          fileName={
            accounts
              .find((account) => account.id === exportTarget.accountId)
              ?.name.replace(/[^a-z0-9]/gi, '-')
              .toLowerCase() ?? 'account-export'
          }
          onClose={closeExport}
        />
      )}

      <SidebarMobileConfigExportModal
        accountId={mobileConfigAccountId}
        accounts={accounts}
        onConfirm={onConfirmMobileConfigExport}
        onClose={closeMobileConfigExport}
      />
    </>
  );
};
