import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTaskSelection } from '$context/taskSelectionContext';
import { useTaskListSelection } from '$hooks/ui/useTaskListSelection';
import { TaskSelectionProvider } from '$providers/TaskSelectionProvider';
import type { Task } from '$types/task/model';
import { makeTask } from '../../fixtures';

const { setEditorOpen, setSelectedTask } = vi.hoisted(() => ({
  setEditorOpen: vi.fn(),
  setSelectedTask: vi.fn(),
}));

vi.mock('$hooks/queries/useUIState', () => ({
  useSetEditorOpen: () => ({ mutate: setEditorOpen }),
  useSetSelectedTask: () => ({ mutate: setSelectedTask }),
  useUIState: () => ({ data: { selectedTaskId: null, isEditorOpen: false } }),
}));

const tasks: Task[] = [
  makeTask({ id: 'task-1' }),
  makeTask({ id: 'task-2' }),
  makeTask({ id: 'task-3' }),
];

const Probe = () => {
  const { selectedTaskIds, setSelection } = useTaskSelection();
  const { handleTaskContextMenu } = useTaskListSelection({ visibleTasks: tasks });

  return createElement(
    'div',
    null,
    createElement(
      'button',
      {
        type: 'button',
        'data-action': 'seed-selection',
        onClick: () => setSelection(['task-1', 'task-2'], 'task-1'),
      },
      'Seed',
    ),
    createElement(
      'button',
      {
        type: 'button',
        'data-action': 'right-click-selected',
        onClick: () => handleTaskContextMenu(tasks[1]),
      },
      'Selected',
    ),
    createElement(
      'button',
      {
        type: 'button',
        'data-action': 'right-click-unselected',
        onClick: () => handleTaskContextMenu(tasks[2]),
      },
      'Unselected',
    ),
    createElement('output', { 'data-selected-ids': selectedTaskIds.join(',') }),
  );
};

describe('useTaskListSelection context-menu behavior', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    setEditorOpen.mockReset();
    setSelectedTask.mockReset();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => {
      root.render(createElement(TaskSelectionProvider, null, createElement(Probe)));
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const click = (action: string) => {
    act(() => {
      container.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)?.click();
    });
  };

  const selectedIds = () => container.querySelector('output')?.getAttribute('data-selected-ids');

  it('preserves the selection when right-clicking a selected task', () => {
    click('seed-selection');
    click('right-click-selected');

    expect(selectedIds()).toBe('task-1,task-2');
  });

  it('collapses the selection to the right-clicked task when it is not selected', () => {
    click('seed-selection');
    click('right-click-unselected');

    expect(selectedIds()).toBe('task-3');
  });
});
