import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SyncSettings } from '$components/settings/SyncSettings';

const mockUseAccounts = vi.fn();
const mockUseSettingsStore = vi.fn();
const mockUseSyncStore = vi.fn();

vi.mock('$hooks/queries/useAccounts', () => ({
  useAccounts: () => mockUseAccounts(),
}));

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => mockUseSettingsStore(),
}));

vi.mock('$context/syncContext', () => ({
  useSyncStore: () => mockUseSyncStore(),
}));

describe('SyncSettings', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockUseAccounts.mockReturnValue({ data: [] });
    mockUseSettingsStore.mockReturnValue({
      autoSync: true,
      setAutoSync: vi.fn(),
      syncInterval: 15,
      setSyncInterval: vi.fn(),
      syncOnStartup: true,
      setSyncOnStartup: vi.fn(),
      syncOnReconnect: true,
      setSyncOnReconnect: vi.fn(),
      dateFormat: 'MMM d, yyyy',
      timeFormat: '12',
    });
    mockUseSyncStore.mockReturnValue({
      isSyncing: false,
      syncingCalendarId: null,
      syncProgress: null,
      lastSyncTime: null,
      lastSyncSource: null,
      lastSyncError: null,
      requestSync: vi.fn(),
    });

    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  it('includes the account name when a calendar is syncing', async () => {
    mockUseAccounts.mockReturnValue({
      data: [
        {
          id: 'account-1',
          name: 'Personal',
          calendars: [
            {
              id: 'calendar-1',
              accountId: 'account-1',
              displayName: 'Tasks',
              url: 'https://example.invalid/tasks/',
              sortOrder: 100,
            },
          ],
          isActive: true,
          sortOrder: 100,
          caldav: {
            serverUrl: 'https://example.invalid/',
            username: 'user',
            password: 'secret',
            serverType: 'generic',
            authType: 'basic',
          },
        },
      ],
    });
    mockUseSyncStore.mockReturnValue({
      isSyncing: true,
      syncingCalendarId: 'calendar-1',
      syncProgress: { current: 1, total: 1 },
      lastSyncTime: null,
      lastSyncSource: null,
      lastSyncError: null,
      requestSync: vi.fn(),
    });

    await act(async () => {
      root.render(<SyncSettings />);
    });

    expect(container.textContent).toContain('Syncing Tasks');
    expect(container.textContent).toContain('Personal · 1/1 calendars');
  });
});
