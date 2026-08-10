import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskEditorSubtasks } from '$components/taskEditor/TaskEditorSubtasks';
import { makeTask } from '../fixtures';

const { sortMode, getSortedTasksMock } = vi.hoisted(() => ({
  sortMode: { current: 'manual' as 'manual' | 'title' },
  getSortedTasksMock: vi.fn((tasks: ReturnType<typeof makeTask>[]) => tasks),
}));

vi.mock('@dnd-kit/core', () => ({
  closestCenter: vi.fn(),
  DndContext: ({ children }: { children: ReactNode }) => children,
  DragOverlay: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: ReactNode }) => children,
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock('$hooks/queries/useTasks', () => ({
  useChildTasks: () => ({
    data: [
      makeTask({ id: 'subtask-1', uid: 'subtask-1-uid', parentUid: 'parent-uid' }),
      makeTask({ id: 'subtask-2', uid: 'subtask-2-uid', parentUid: 'parent-uid' }),
    ],
  }),
  useCreateTask: () => ({ mutate: vi.fn() }),
  useTasks: () => ({
    data: [
      makeTask({ id: 'parent', uid: 'parent-uid' }),
      makeTask({ id: 'subtask-1', uid: 'subtask-1-uid', parentUid: 'parent-uid' }),
      makeTask({ id: 'subtask-2', uid: 'subtask-2-uid', parentUid: 'parent-uid' }),
    ],
  }),
}));

vi.mock('$hooks/queries/useUIState', () => ({
  useSortConfig: () => ({ mode: sortMode.current, direction: 'asc' }),
}));

vi.mock('$hooks/ui/useSortableDrag', () => ({
  truncateName: (name: string) => name,
  useSortableDrag: ({ flattenedItems }: { flattenedItems: unknown[] }) => ({
    activeItem: null,
    targetIndent: 0,
    targetParentName: null,
    originalIndentRef: { current: 0 },
    visibleItems: flattenedItems,
    sensors: [],
    handleDragStart: vi.fn(),
    handleDragMove: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragCancel: vi.fn(),
  }),
}));

vi.mock('$lib/store/tasks', () => ({
  getSortedTasks: getSortedTasksMock,
}));

vi.mock('$components/taskEditor/TaskEditorSubtaskItem', () => ({
  TaskEditorSubtaskItem: ({
    task,
    isDragEnabled,
  }: {
    task: { id: string };
    isDragEnabled: boolean;
  }) =>
    createElement('div', {
      'data-subtask-id': task.id,
      'data-subtask-drag-enabled': String(isDragEnabled),
    }),
}));

describe('TaskEditorSubtasks', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    sortMode.current = 'manual';
    getSortedTasksMock.mockClear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  const renderSubtasks = async () => {
    await act(async () => {
      root.render(
        createElement(TaskEditorSubtasks, {
          task: makeTask({ id: 'parent', uid: 'parent-uid' }),
          checkmarkColor: '#fff',
          useAccentColorForCheckboxes: false,
          updateTask: vi.fn(),
          moveTaskToRecentlyDeleted: vi.fn(async () => true),
        }),
      );
    });
  };

  it('enables subtask dragging only with manual task sorting', async () => {
    await renderSubtasks();

    expect(
      Array.from(container.querySelectorAll('[data-subtask-drag-enabled]')).map((item) =>
        item.getAttribute('data-subtask-drag-enabled'),
      ),
    ).toEqual(['true', 'true']);
    expect(getSortedTasksMock).toHaveBeenCalledWith(expect.any(Array), {
      mode: 'manual',
      direction: 'asc',
    });

    sortMode.current = 'title';
    await renderSubtasks();

    expect(
      Array.from(container.querySelectorAll('[data-subtask-drag-enabled]')).map((item) =>
        item.getAttribute('data-subtask-drag-enabled'),
      ),
    ).toEqual(['false', 'false']);
    expect(getSortedTasksMock).toHaveBeenLastCalledWith(expect.any(Array), {
      mode: 'title',
      direction: 'asc',
    });
  });
});
