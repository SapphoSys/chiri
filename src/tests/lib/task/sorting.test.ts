import { describe, expect, it } from 'vitest';
import { sortTasks } from '$lib/task/sorting';
import { makeTask } from '../../fixtures';

describe('sortTasks', () => {
  it('sorts by the configured field and direction', () => {
    const tasks = [
      makeTask({ id: 'low', priority: 'low' }),
      makeTask({ id: 'high', priority: 'high' }),
      makeTask({ id: 'medium', priority: 'medium' }),
    ];

    expect(sortTasks(tasks, { mode: 'priority', direction: 'asc' }).map((task) => task.id)).toEqual(
      ['high', 'medium', 'low'],
    );
    expect(
      sortTasks(tasks, { mode: 'priority', direction: 'desc' }).map((task) => task.id),
    ).toEqual(['low', 'medium', 'high']);
  });

  it('moves completed and cancelled tasks to the bottom without re-sorting them', () => {
    const tasks = [
      makeTask({ id: 'completed', status: 'completed', sortOrder: 100 }),
      makeTask({ id: 'active', status: 'needs-action', sortOrder: 200 }),
      makeTask({ id: 'cancelled', status: 'cancelled', sortOrder: 300 }),
    ];

    expect(
      sortTasks(tasks, { mode: 'manual', direction: 'asc' }, true).map((task) => task.id),
    ).toEqual(['active', 'completed', 'cancelled']);
  });
});
