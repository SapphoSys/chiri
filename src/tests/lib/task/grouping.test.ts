import { describe, expect, it } from 'vitest';
import { groupTasks } from '$lib/task/grouping';
import { makeTask } from '../../fixtures';

describe('groupTasks', () => {
  it('groups tasks by priority in the configured direction', () => {
    const tasks = [
      makeTask({ id: 'low', priority: 'low' }),
      makeTask({ id: 'high', priority: 'high' }),
    ];

    const groups = groupTasks(tasks, 'priority', new Map(), false, 'desc');

    expect(groups.map((group) => group.label)).toEqual(['Low Priority', 'High Priority']);
    expect(groups.flatMap((group) => group.tasks.map((task) => task.id))).toEqual(['low', 'high']);
  });

  it('keeps completed tasks in a final collapsed group when requested', () => {
    const groups = groupTasks(
      [
        makeTask({ id: 'active', priority: 'none' }),
        makeTask({ id: 'completed', status: 'completed', priority: 'none' }),
        makeTask({ id: 'cancelled', status: 'cancelled', priority: 'none' }),
      ],
      'priority',
      new Map(),
      true,
    );

    expect(groups[groups.length - 1]).toMatchObject({
      key: 'completed',
      label: 'Completed & Cancelled',
      defaultCollapsed: true,
    });
  });
});
