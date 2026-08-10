import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskEditorSubtaskItem } from '$components/taskEditor/TaskEditorSubtaskItem';
import { makeTask } from '../fixtures';

vi.mock('@dnd-kit/sortable', () => ({
  defaultAnimateLayoutChanges: vi.fn(),
  useSortable: () => ({
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}));

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => ({ syncStatusProgress: false }),
}));

vi.mock('$hooks/queries/useTasks', () => ({
  useChildTasks: () => ({ data: [] }),
}));

vi.mock('$hooks/ui/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: () => false,
}));

vi.mock('$lib/task/status', () => ({
  buildStatusUpdates: vi.fn(() => ({})),
}));

vi.mock('$utils/sortable', () => ({
  getSortableItemDisabled: () => true,
  getSortableItemId: (id: string) => id,
}));

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('TaskEditorSubtaskItem', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('does not move an already-untitled subtask to Recently Deleted on blur', async () => {
    const moveTaskToRecentlyDeleted = vi.fn(async () => true);
    const task = makeTask({ id: 'subtask-1', title: '', parentUid: 'parent-uid' });

    await act(async () => {
      root.render(
        createElement(TaskEditorSubtaskItem, {
          task,
          depth: 0,
          checkmarkColor: '#fff',
          useAccentColorForCheckboxes: false,
          expandedSubtasks: new Set<string>(),
          setExpandedSubtasks: vi.fn(),
          updateTask: vi.fn(),
          moveTaskToRecentlyDeleted,
          isDragEnabled: false,
        }),
      );
    });

    const row = container.querySelector<HTMLElement>('[role="button"]');
    expect(row).toBeDefined();

    await act(async () => row?.click());
    const input = container.querySelector<HTMLInputElement>('input');
    expect(input).toBeTruthy();

    await act(async () => input?.blur());

    expect(moveTaskToRecentlyDeleted).not.toHaveBeenCalled();
  });

  it('persists an empty title instead of deleting the subtask when cleared and submitted', async () => {
    const moveTaskToRecentlyDeleted = vi.fn(async () => true);
    const updateTask = vi.fn();
    const task = makeTask({ id: 'subtask-2', title: 'Existing title', parentUid: 'parent-uid' });

    await act(async () => {
      root.render(
        createElement(TaskEditorSubtaskItem, {
          task,
          depth: 0,
          checkmarkColor: '#fff',
          useAccentColorForCheckboxes: false,
          expandedSubtasks: new Set<string>(),
          setExpandedSubtasks: vi.fn(),
          updateTask,
          moveTaskToRecentlyDeleted,
          isDragEnabled: false,
        }),
      );
    });

    const row = container.querySelector<HTMLElement>('[role="button"]');
    expect(row).toBeDefined();

    await act(async () => row?.click());
    const input = container.querySelector<HTMLInputElement>('input');
    expect(input).toBeTruthy();

    await act(async () => {
      if (!input) return;
      input.focus();
      const setNativeValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      setNativeValue?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await act(async () =>
      input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })),
    );

    expect(moveTaskToRecentlyDeleted).not.toHaveBeenCalled();
    expect(updateTask).toHaveBeenCalledWith(task.id, { title: '' });
  });

  it('does not start editing when a subtask control is clicked', async () => {
    const updateTask = vi.fn();
    const task = makeTask({ id: 'subtask-3', title: 'Existing title', parentUid: 'parent-uid' });

    await act(async () => {
      root.render(
        createElement(TaskEditorSubtaskItem, {
          task,
          depth: 0,
          checkmarkColor: '#fff',
          useAccentColorForCheckboxes: false,
          expandedSubtasks: new Set<string>(),
          setExpandedSubtasks: vi.fn(),
          updateTask,
          moveTaskToRecentlyDeleted: vi.fn(async () => true),
          isDragEnabled: false,
        }),
      );
    });

    const statusButton = container.querySelector('button');
    expect(statusButton).toBeDefined();

    await act(async () => statusButton?.click());

    expect(container.querySelector('input')).toBeNull();
    expect(updateTask).toHaveBeenCalledWith(task.id, {});
  });
});
