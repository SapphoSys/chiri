import { useCallback, useMemo } from 'react';
import { useAccounts } from '$hooks/queries/useAccounts';
import { useFilters } from '$hooks/queries/useFilters';
import { useTags } from '$hooks/queries/useTags';
import {
  useSetActiveAccount,
  useSetActiveCalendar,
  useSetActiveFilter,
  useSetActiveTag,
  useSetAllTasksView,
  useSetRecentlyDeletedView,
  useUIState,
} from '$hooks/queries/useUIState';
import { getCurrentListIndex, getOrderedListItems, type ListItem } from '$utils/navigation';

export const useListNavigationCommands = () => {
  const { data: accounts = [] } = useAccounts();
  const { data: tags = [] } = useTags();
  const { data: filters = [] } = useFilters();
  const { data: uiState } = useUIState();
  const setActiveAccountMutation = useSetActiveAccount();
  const setActiveCalendarMutation = useSetActiveCalendar();
  const setActiveTagMutation = useSetActiveTag();
  const setActiveFilterMutation = useSetActiveFilter();
  const setAllTasksViewMutation = useSetAllTasksView();
  const setRecentlyDeletedViewMutation = useSetRecentlyDeletedView();

  const orderedLists = useMemo(
    () => getOrderedListItems(accounts, filters, tags),
    [accounts, filters, tags],
  );

  const currentListIndex = useMemo(
    () => getCurrentListIndex(orderedLists, uiState),
    [orderedLists, uiState],
  );

  const activateListItem = useCallback(
    (item: ListItem) => {
      if (item.type === 'all') {
        setAllTasksViewMutation.mutate();
        setActiveAccountMutation.mutate(null);
      } else if (item.type === 'calendar') {
        setActiveAccountMutation.mutate(item.accountId);
        setActiveCalendarMutation.mutate(item.calendarId);
      } else if (item.type === 'tag') {
        setActiveTagMutation.mutate(item.tagId);
      } else if (item.type === 'filter') {
        setActiveFilterMutation.mutate(item.filterId);
      } else {
        setRecentlyDeletedViewMutation.mutate();
      }
    },
    [
      setAllTasksViewMutation,
      setActiveAccountMutation,
      setActiveCalendarMutation,
      setActiveFilterMutation,
      setActiveTagMutation,
      setRecentlyDeletedViewMutation,
    ],
  );

  const navPrevList = useCallback(() => {
    const prevIndex = Math.max(0, currentListIndex - 1);
    if (prevIndex !== currentListIndex) activateListItem(orderedLists[prevIndex]);
  }, [orderedLists, currentListIndex, activateListItem]);

  const navNextList = useCallback(() => {
    const nextIndex = Math.min(orderedLists.length - 1, currentListIndex + 1);
    if (nextIndex !== currentListIndex) activateListItem(orderedLists[nextIndex]);
  }, [orderedLists, currentListIndex, activateListItem]);

  return {
    navPrevList,
    navNextList,
  };
};
