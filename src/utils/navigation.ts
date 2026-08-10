import type { Account } from '$types/account';
import type { Filter } from '$types/filter';
import type { UIState } from '$types/store/state';
import type { Tag } from '$types/tag';

export type ListItem =
  | { type: 'all' }
  | { type: 'recently-deleted' }
  | { type: 'filter'; filterId: string }
  | { type: 'calendar'; accountId: string; calendarId: string }
  | { type: 'tag'; tagId: string };

export const getOrderedListItems = (
  accounts: Account[],
  filters: Filter[],
  tags: Tag[],
): ListItem[] => {
  const items: ListItem[] = [{ type: 'all' }, { type: 'recently-deleted' }];

  for (const filter of filters) {
    items.push({ type: 'filter', filterId: filter.id });
  }

  for (const account of accounts) {
    for (const calendar of account.calendars) {
      items.push({ type: 'calendar', accountId: account.id, calendarId: calendar.id });
    }
  }

  for (const tag of tags) {
    items.push({ type: 'tag', tagId: tag.id });
  }

  return items;
};

export const getListItemKey = (item: ListItem) => {
  switch (item.type) {
    case 'all':
      return 'all';
    case 'recently-deleted':
      return 'recently-deleted';
    case 'filter':
      return `filter:${item.filterId}`;
    case 'calendar':
      return `calendar:${item.calendarId}`;
    case 'tag':
      return `tag:${item.tagId}`;
  }
};

export const getActiveListKey = (
  uiState?: Pick<UIState, 'activeView' | 'activeCalendarId' | 'activeTagId' | 'activeFilterId'>,
) => {
  if (uiState?.activeView === 'recently-deleted') return 'recently-deleted';
  if (uiState?.activeView === 'filter' && uiState.activeFilterId !== null) {
    return `filter:${uiState.activeFilterId}`;
  }
  if (uiState?.activeTagId !== null && uiState?.activeTagId !== undefined) {
    return `tag:${uiState.activeTagId}`;
  }
  if (uiState?.activeCalendarId !== null && uiState?.activeCalendarId !== undefined) {
    return `calendar:${uiState.activeCalendarId}`;
  }
  return 'all';
};

export const getCurrentListIndex = (items: ListItem[], uiState?: UIState) => {
  const activeKey = getActiveListKey(uiState);
  const index = items.findIndex((item) => getListItemKey(item) === activeKey);
  return index >= 0 ? index : 0;
};
