import { useCallback } from 'react';
import { useModalState } from '$context/modalStateContext';
import { useCalendarDeletion } from '$hooks/deletion/useCalendarDeletion';
import { useAccounts } from '$hooks/queries/useAccounts';
import { useUIState } from '$hooks/queries/useUIState';
import type { AppModals } from '$types/modals';

interface UseCalendarCommandsOptions {
  modals: AppModals;
  onSyncCalendar?: (calendarId: string) => void;
}

export const useCalendarCommands = ({ modals, onSyncCalendar }: UseCalendarCommandsOptions) => {
  const { data: accounts = [] } = useAccounts();
  const { data: uiState } = useUIState();
  const { isAnyModalOpen } = useModalState();
  const { deleteCalendar } = useCalendarDeletion();
  const activeCalendarId = uiState?.activeCalendarId ?? null;

  const openCreateCalendar = useCallback(
    (accountId?: string) => {
      if (isAnyModalOpen) return;
      if (accounts.length > 0) {
        modals.openCreateCalendar(accountId ?? accounts[0].id);
      }
    },
    [accounts, isAnyModalOpen, modals],
  );

  const syncCalendar = useCallback(
    (calendarId: string) => {
      onSyncCalendar?.(calendarId);
    },
    [onSyncCalendar],
  );

  const editCalendar = useCallback(
    (calendarId: string, accountId: string) => {
      if (isAnyModalOpen) return;
      modals.openCalendar({ calendarId, accountId });
    },
    [isAnyModalOpen, modals],
  );

  const exportCalendar = useCallback(
    (calendarId: string) => {
      if (isAnyModalOpen) return;
      modals.openExport(calendarId);
    },
    [isAnyModalOpen, modals],
  );

  const deleteCalendarCommand = useCallback(
    async (calendarId: string, accountId: string) => {
      await deleteCalendar(calendarId, accountId, accounts, activeCalendarId);
    },
    [accounts, activeCalendarId, deleteCalendar],
  );

  return {
    openCreateCalendar,
    syncCalendar,
    editCalendar,
    exportCalendar,
    deleteCalendar: deleteCalendarCommand,
  };
};
