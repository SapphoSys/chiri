import { useCallback } from 'react';
import { useSettingsStore } from '$context/settingsContext';
import { useAccountDeletion } from '$hooks/deletion/useAccountDeletion';
import { useCalendarDeletion } from '$hooks/deletion/useCalendarDeletion';
import { useFilterDeletion } from '$hooks/deletion/useFilterDeletion';
import { useTagDeletion } from '$hooks/deletion/useTagDeletion';
import { useCreateAccount } from '$hooks/queries/useAccounts';
import { useCreateFilter } from '$hooks/queries/useFilters';
import {
  useSetActiveAccount,
  useSetActiveCalendar,
  useSetActiveFilter,
  useSetActiveTag,
  useSetAllTasksView,
  useSetRecentlyDeletedView,
} from '$hooks/queries/useUIState';
import type { Account } from '$types/account';
import type { FilterPresetDefinition } from '$types/filter';
import type { Tag } from '$types/tag';

interface UseSidebarActionsOptions {
  accounts: Account[];
  tags: Tag[];
  activeCalendarId: string | null;
  accountsSectionCollapsed: boolean;
  openCreateCalendar: (accountId: string) => void;
}

export const useSidebarActions = ({
  accounts,
  tags,
  activeCalendarId,
  accountsSectionCollapsed,
  openCreateCalendar,
}: UseSidebarActionsOptions) => {
  const { setExpandedAccountIds, toggleAccountExpanded, toggleAccountsSectionCollapsed } =
    useSettingsStore();
  const setActiveAccountMutation = useSetActiveAccount();
  const setActiveCalendarMutation = useSetActiveCalendar();
  const setActiveTagMutation = useSetActiveTag();
  const setActiveFilterMutation = useSetActiveFilter();
  const setAllTasksViewMutation = useSetAllTasksView();
  const setRecentlyDeletedViewMutation = useSetRecentlyDeletedView();
  const createFilterMutation = useCreateFilter();
  const createAccountMutation = useCreateAccount();
  const { deleteAccount } = useAccountDeletion();
  const { deleteCalendar } = useCalendarDeletion();
  const { deleteFilter } = useFilterDeletion();
  const { deleteTag } = useTagDeletion();

  const handleSelectAllTasks = useCallback(() => {
    setAllTasksViewMutation.mutate();
    setActiveAccountMutation.mutate(null);
  }, [setActiveAccountMutation, setAllTasksViewMutation]);

  const handleSelectRecentlyDeleted = useCallback(() => {
    setRecentlyDeletedViewMutation.mutate();
  }, [setRecentlyDeletedViewMutation]);

  const handleSelectCalendar = useCallback(
    (accountId: string, calendarId: string) => {
      setActiveAccountMutation.mutate(accountId);
      setActiveCalendarMutation.mutate(calendarId);
    },
    [setActiveAccountMutation, setActiveCalendarMutation],
  );

  const handleSelectTag = useCallback(
    (tagId: string) => {
      setActiveTagMutation.mutate(tagId);
    },
    [setActiveTagMutation],
  );

  const handleSelectFilter = useCallback(
    (filterId: string) => {
      setActiveFilterMutation.mutate(filterId);
    },
    [setActiveFilterMutation],
  );

  const handleAddLocalCalendar = useCallback(async () => {
    let localAccount = accounts.find((account) => !account.caldav);
    if (!localAccount) {
      localAccount = await createAccountMutation.mutateAsync({
        name: 'Local',
        caldav: null,
      });
    }
    openCreateCalendar(localAccount.id);
  }, [accounts, createAccountMutation, openCreateCalendar]);

  const handleDeleteAccount = useCallback(
    async (accountId: string) => {
      await deleteAccount(accountId, accounts);
    },
    [accounts, deleteAccount],
  );

  const handleDeleteCalendar = useCallback(
    async (calendarId: string, accountId: string) => {
      await deleteCalendar(calendarId, accountId, accounts, activeCalendarId);
    },
    [accounts, activeCalendarId, deleteCalendar],
  );

  const handleDeleteTag = useCallback(
    async (tagId: string) => {
      await deleteTag(tagId, tags);
    },
    [deleteTag, tags],
  );

  const handleDeleteFilter = useCallback(
    async (filterId: string) => {
      await deleteFilter(filterId);
    },
    [deleteFilter],
  );

  const handleCreateFilterPreset = useCallback(
    (preset: FilterPresetDefinition) => {
      createFilterMutation.mutate(
        {
          presetId: preset.presetId,
          name: preset.name,
          icon: preset.icon,
          combinator: preset.combinator,
          criteria: preset.criteria,
        },
        {
          onSuccess: (filter) => setActiveFilterMutation.mutate(filter.id),
        },
      );
    },
    [createFilterMutation, setActiveFilterMutation],
  );

  const handleToggleAccount = useCallback(
    (accountId: string) => {
      toggleAccountExpanded(accountId);
    },
    [toggleAccountExpanded],
  );

  const handleExpandAllAccounts = useCallback(() => {
    setExpandedAccountIds(accounts.map((account) => account.id));
    if (accountsSectionCollapsed) {
      toggleAccountsSectionCollapsed();
    }
  }, [accounts, accountsSectionCollapsed, setExpandedAccountIds, toggleAccountsSectionCollapsed]);

  const handleCollapseAllAccounts = useCallback(() => {
    setExpandedAccountIds([]);
    if (!accountsSectionCollapsed) {
      toggleAccountsSectionCollapsed();
    }
  }, [accountsSectionCollapsed, setExpandedAccountIds, toggleAccountsSectionCollapsed]);

  return {
    handleSelectAllTasks,
    handleSelectRecentlyDeleted,
    handleSelectCalendar,
    handleSelectTag,
    handleSelectFilter,
    handleAddLocalCalendar,
    handleDeleteAccount,
    handleDeleteCalendar,
    handleDeleteTag,
    handleDeleteFilter,
    handleCreateFilterPreset,
    handleToggleAccount,
    handleExpandAllAccounts,
    handleCollapseAllAccounts,
  };
};
