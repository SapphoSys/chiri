import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSidebarActions } from '$hooks/ui/useSidebarActions';
import type { Account } from '$types/account';
import type { Tag } from '$types/tag';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    setActiveAccount: vi.fn(),
    setActiveCalendar: vi.fn(),
    setActiveFilter: vi.fn(),
    setActiveTag: vi.fn(),
    setAllTasksView: vi.fn(),
    setRecentlyDeletedView: vi.fn(),
    createFilter: vi.fn(),
    createLocalAccount: vi.fn(),
    deleteAccount: vi.fn(),
    deleteCalendar: vi.fn(),
    deleteFilter: vi.fn(),
    deleteTag: vi.fn(),
    setExpandedAccountIds: vi.fn(),
    toggleAccountExpanded: vi.fn(),
    toggleAccountsSectionCollapsed: vi.fn(),
  },
}));

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => ({
    setExpandedAccountIds: mocks.setExpandedAccountIds,
    toggleAccountExpanded: mocks.toggleAccountExpanded,
    toggleAccountsSectionCollapsed: mocks.toggleAccountsSectionCollapsed,
  }),
}));

vi.mock('$hooks/deletion/useAccountDeletion', () => ({
  useAccountDeletion: () => ({ deleteAccount: mocks.deleteAccount }),
}));
vi.mock('$hooks/deletion/useCalendarDeletion', () => ({
  useCalendarDeletion: () => ({ deleteCalendar: mocks.deleteCalendar }),
}));
vi.mock('$hooks/deletion/useFilterDeletion', () => ({
  useFilterDeletion: () => ({ deleteFilter: mocks.deleteFilter }),
}));
vi.mock('$hooks/deletion/useTagDeletion', () => ({
  useTagDeletion: () => ({ deleteTag: mocks.deleteTag }),
}));
vi.mock('$hooks/queries/useAccounts', () => ({
  useCreateAccount: () => ({ mutateAsync: mocks.createLocalAccount }),
}));
vi.mock('$hooks/queries/useFilters', () => ({
  useCreateFilter: () => ({ mutate: mocks.createFilter }),
}));
vi.mock('$hooks/queries/useUIState', () => ({
  useSetActiveAccount: () => ({ mutate: mocks.setActiveAccount }),
  useSetActiveCalendar: () => ({ mutate: mocks.setActiveCalendar }),
  useSetActiveFilter: () => ({ mutate: mocks.setActiveFilter }),
  useSetActiveTag: () => ({ mutate: mocks.setActiveTag }),
  useSetAllTasksView: () => ({ mutate: mocks.setAllTasksView }),
  useSetRecentlyDeletedView: () => ({ mutate: mocks.setRecentlyDeletedView }),
}));

const accounts: Account[] = [
  {
    id: 'account-1',
    name: 'Account 1',
    calendars: [],
    isActive: true,
    sortOrder: 0,
    caldav: null,
  },
];
const tags: Tag[] = [{ id: 'tag-1', name: 'Tag 1', color: '#fff', sortOrder: 0 }];

const ActionsProbe = () => {
  const actions = useSidebarActions({
    accounts,
    tags,
    activeCalendarId: 'calendar-1',
    accountsSectionCollapsed: true,
    openCreateCalendar: vi.fn(),
  });

  return (
    <>
      <button type="button" data-action="all-tasks" onClick={actions.handleSelectAllTasks} />
      <button
        type="button"
        data-action="calendar"
        onClick={() => actions.handleSelectCalendar('account-1', 'calendar-1')}
      />
      <button type="button" data-action="tag" onClick={() => actions.handleSelectTag('tag-1')} />
      <button
        type="button"
        data-action="filter"
        onClick={() => actions.handleSelectFilter('filter-1')}
      />
      <button
        type="button"
        data-action="delete-account"
        onClick={() => void actions.handleDeleteAccount('account-1')}
      />
      <button type="button" data-action="expand-all" onClick={actions.handleExpandAllAccounts} />
    </>
  );
};

describe('useSidebarActions', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(createElement(ActionsProbe)));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('routes navigation actions to their existing mutations', () => {
    act(() =>
      container
        .querySelector('[data-action="all-tasks"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    );
    act(() =>
      container
        .querySelector('[data-action="calendar"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    );
    act(() =>
      container
        .querySelector('[data-action="tag"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    );
    act(() =>
      container
        .querySelector('[data-action="filter"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    );

    expect(mocks.setAllTasksView).toHaveBeenCalledOnce();
    expect(mocks.setActiveAccount).toHaveBeenCalledWith(null);
    expect(mocks.setActiveCalendar).toHaveBeenCalledWith('calendar-1');
    expect(mocks.setActiveTag).toHaveBeenCalledWith('tag-1');
    expect(mocks.setActiveFilter).toHaveBeenCalledWith('filter-1');
  });

  it('preserves account deletion and expand-all behavior', async () => {
    mocks.deleteAccount.mockResolvedValue(true);

    await act(async () => {
      container
        .querySelector('[data-action="delete-account"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    act(() =>
      container
        .querySelector('[data-action="expand-all"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true })),
    );

    expect(mocks.deleteAccount).toHaveBeenCalledWith('account-1', accounts);
    expect(mocks.setExpandedAccountIds).toHaveBeenCalledWith(['account-1']);
    expect(mocks.toggleAccountsSectionCollapsed).toHaveBeenCalledOnce();
  });
});
