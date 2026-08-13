import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskItemContextMenu } from '$components/taskItem/TaskItemContextMenu';
import type { Task } from '$types/task/model';
import { makeTask } from '../fixtures';

const mocks = vi.hoisted(() => ({
  currentTasks: [] as Task[],
  selectedTaskIds: [] as string[],
  batchSelectedTaskIds: [] as string[],
  handleDelete: vi.fn(),
  clearSelection: vi.fn(),
  setContextMenu: vi.fn(),
}));

vi.mock('$components/FloatingLayerFrame', () => ({
  FloatingLayerFrame: ({ children }: { children: ReactNode }) =>
    createElement('div', { 'data-testid': 'context-menu' }, children),
}));

vi.mock('$components/modals/BatchTaskTagsModal', () => ({
  BatchTaskTagsModal: () => null,
}));

vi.mock('$components/modals/ExportModal', () => ({
  ExportModal: () => null,
}));

vi.mock('$components/modals/MoveToCalendar/MoveToCalendarModal', () => ({
  MoveToCalendarModal: () => null,
}));

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => ({ syncStatusProgress: true }),
}));

vi.mock('$context/taskSelectionContext', () => ({
  useTaskSelection: () => ({
    selectedTaskIds: mocks.selectedTaskIds,
    clearSelection: mocks.clearSelection,
  }),
}));

vi.mock('$hooks/queries/useTasks', () => ({
  useCreateTask: () => ({ mutate: vi.fn() }),
  useTasks: () => ({ data: mocks.currentTasks }),
  useUpdateTask: () => ({ mutate: vi.fn() }),
}));

vi.mock('$hooks/queries/useUIState', () => ({
  useSetSelectedTask: () => ({ mutate: vi.fn() }),
}));

vi.mock('$hooks/ui/useTaskBatchActions', () => ({
  useTaskBatchActions: ({ selectedTasks }: { selectedTasks: Task[] }) => {
    mocks.batchSelectedTaskIds = selectedTasks.map((task) => task.id);
    return {
      accounts: [],
      currentCalendarIds: [],
      exportTasks: selectedTasks,
      handleDelete: mocks.handleDelete,
      handleMoveToCalendar: vi.fn(),
      handlePermanentDelete: vi.fn(),
      handlePriorityChange: vi.fn(),
      handleRestore: vi.fn(),
      handleStatusChange: vi.fn(),
      tags: [],
    };
  },
}));

describe('TaskItemContextMenu selection scope', () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderMenu = (task: Task) => {
    act(() => {
      root.render(
        <TaskItemContextMenu
          task={task}
          contextMenu={{ x: 10, y: 10 }}
          onClose={vi.fn()}
          setContextMenu={mocks.setContextMenu}
        />,
      );
    });
  };

  const clickDelete = () => {
    const deleteButton = Array.from(container.querySelectorAll('button')).find((button) =>
      button.textContent?.trim().startsWith('Delete'),
    );
    act(() => deleteButton?.click());
  };

  beforeEach(() => {
    mocks.currentTasks = [
      makeTask({ id: 'task-1', title: 'First task' }),
      makeTask({ id: 'task-2', title: 'Second task' }),
      makeTask({ id: 'task-3', title: 'Third task' }),
    ];
    mocks.selectedTaskIds = [];
    mocks.batchSelectedTaskIds = [];
    mocks.handleDelete.mockReset();
    mocks.clearSelection.mockReset();
    mocks.setContextMenu.mockReset();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('deletes all selected tasks when the right-clicked task is in the selection', () => {
    mocks.selectedTaskIds = ['task-1', 'task-2'];
    renderMenu(mocks.currentTasks[0]);

    expect(mocks.batchSelectedTaskIds).toEqual(['task-1', 'task-2']);

    clickDelete();

    expect(mocks.handleDelete).toHaveBeenCalledOnce();
  });

  it('deletes only the right-clicked task when it is outside the selection', () => {
    mocks.selectedTaskIds = ['task-1', 'task-2'];
    renderMenu(mocks.currentTasks[2]);

    expect(mocks.batchSelectedTaskIds).toEqual(['task-3']);

    clickDelete();

    expect(mocks.handleDelete).toHaveBeenCalledOnce();
  });
});
