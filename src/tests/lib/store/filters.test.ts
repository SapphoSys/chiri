import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Filter } from '$types/filter';
import { makeTask } from '../../fixtures';

vi.mock('@tauri-apps/plugin-sql', () => ({ default: { load: vi.fn() } }));
vi.mock('$lib/database', () => ({
  db: {
    subscribe: vi.fn(() => vi.fn()),
    getIsInitialized: vi.fn(() => false),
  },
}));

import { matchesFilter } from '$lib/filters';

const makeFilter = (overrides: Partial<Filter>): Filter => ({
  id: 'filter-1',
  name: 'Filter',
  combinator: 'all',
  criteria: [],
  sortOrder: 100,
  createdAt: new Date('2026-05-21T00:00:00.000Z'),
  updatedAt: new Date('2026-05-21T00:00:00.000Z'),
  ...overrides,
});

describe('matchesFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-21T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('matches today due-date filters and excludes completed statuses', () => {
    const filter = makeFilter({
      criteria: [
        { field: 'dueDate', op: 'today' },
        { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
      ],
    });

    expect(matchesFilter(makeTask({ dueDate: new Date('2026-05-21T08:00:00.000Z') }), filter)).toBe(
      true,
    );
    expect(
      matchesFilter(
        makeTask({ dueDate: new Date('2026-05-21T08:00:00.000Z'), status: 'completed' }),
        filter,
      ),
    ).toBe(false);
    expect(matchesFilter(makeTask({ dueDate: new Date('2026-05-22T08:00:00.000Z') }), filter)).toBe(
      false,
    );
  });

  it('matches recent modified windows against the past', () => {
    const filter = makeFilter({
      criteria: [{ field: 'modifiedAt', op: 'withinDays', value: 7 }],
    });

    expect(
      matchesFilter(makeTask({ modifiedAt: new Date('2026-05-18T12:00:00.000Z') }), filter),
    ).toBe(true);
    expect(
      matchesFilter(makeTask({ modifiedAt: new Date('2026-05-10T12:00:00.000Z') }), filter),
    ).toBe(false);
  });

  it('supports any-mode filters', () => {
    const filter = makeFilter({
      combinator: 'any',
      criteria: [
        { field: 'priority', op: 'is', value: 'high' },
        { field: 'tags', op: 'hasAny', value: ['tag-1'] },
      ],
    });

    expect(matchesFilter(makeTask({ priority: 'low', tags: ['tag-1'] }), filter)).toBe(true);
    expect(matchesFilter(makeTask({ priority: 'high', tags: [] }), filter)).toBe(true);
    expect(matchesFilter(makeTask({ priority: 'low', tags: [] }), filter)).toBe(false);
  });
});
