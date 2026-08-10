import type DatabasePlugin from '@tauri-apps/plugin-sql';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeTask } from '../../fixtures';

const mocks = vi.hoisted(() => ({
  getUIState: vi.fn(),
  settingsState: {
    defaultCalendarId: null,
    defaultPriority: 'none' as const,
    defaultTags: ['default-tag'],
  },
}));

vi.mock('$context/settingsContext', () => ({
  settingsStore: { getState: () => mocks.settingsState },
}));

vi.mock('$lib/database/accounts', () => ({ getAllAccounts: vi.fn() }));
vi.mock('$lib/database/converters', () => ({ rowToTask: vi.fn() }));
vi.mock('$lib/database/ui', () => ({
  getUIState: mocks.getUIState,
  setSelectedTask: vi.fn(),
}));
vi.mock('$lib/ical/vtodo', () => ({ toAppleEpoch: vi.fn(() => 0) }));

import { createTask } from '$lib/database/tasks';

describe('database task creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUIState.mockResolvedValue({
      activeTagId: 'tag-b',
      activeCalendarId: null,
      activeAccountId: null,
    });
  });

  it('persists remote tags without applying UI tag defaults', async () => {
    const connection = {
      select: vi.fn().mockResolvedValue([{ max_order: null }]),
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as DatabasePlugin;

    const task = await createTask(
      connection,
      makeTask({ id: 'remote-id', uid: 'remote-uid', tags: ['tag-a'], synced: true }),
      { source: 'remote' },
    );

    expect(task.tags).toEqual(['tag-a']);
    const params = vi.mocked(connection.execute).mock.calls[0]?.[1] as unknown[];
    expect(params[8]).toBe(JSON.stringify(['tag-a']));
  });
});
