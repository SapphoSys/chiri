import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskBatchActionsBar } from '$components/header/TaskBatchActionsBar/TaskBatchActionsBar';
import { makeTask } from '../fixtures';

const mocks = vi.hoisted(() => ({
  openTagsModal: vi.fn(),
  openDatesModal: vi.fn(),
  openMoveModal: vi.fn(),
  openExportModal: vi.fn(),
  handleDelete: vi.fn(),
  onClearSelection: vi.fn(),
}));

vi.mock('$hooks/ui/useTaskBatchActionsLayout', () => ({
  useTaskBatchActionsLayout: () => ({
    toolbarRef: { current: null },
    isCompact: false,
    isTight: false,
  }),
}));

vi.mock('$hooks/ui/useTaskBatchActions', () => ({
  useTaskBatchActions: ({
    selectedTasks,
    onClearSelection,
  }: {
    selectedTasks: unknown[];
    onClearSelection: () => void;
  }) => ({
    selectedCount: selectedTasks.length,
    openMenu: null,
    toggleMenu: vi.fn(),
    closeMenu: vi.fn(),
    statusButtonRef: { current: null },
    priorityButtonRef: { current: null },
    accounts: [],
    tags: [],
    timeFormat: '24h',
    allCalendars: [],
    currentCalendarIds: [],
    exportTasks: selectedTasks,
    showTagsModal: false,
    showDatesModal: false,
    showMoveModal: false,
    showExportModal: false,
    openTagsModal: mocks.openTagsModal,
    openDatesModal: mocks.openDatesModal,
    openMoveModal: mocks.openMoveModal,
    openExportModal: mocks.openExportModal,
    handleDelete: mocks.handleDelete,
    handlePermanentDelete: vi.fn(),
    handleRestore: vi.fn(),
    handleStatusChange: vi.fn(),
    handlePriorityChange: vi.fn(),
    handleMoveToCalendar: vi.fn(),
    closeTagsModal: vi.fn(),
    closeDatesModal: vi.fn(),
    closeMoveModal: vi.fn(),
    closeExportModal: vi.fn(),
    onClearSelection,
  }),
}));

vi.mock('$components/header/TaskBatchActionsBar/TaskBatchActionsToolbar', () => ({
  TaskBatchActionsToolbar: ({
    selectedCount,
    onClearSelection,
    onOpenTagsModal,
    onOpenDatesModal,
    onOpenMoveModal,
    onOpenExportModal,
    onDelete,
  }: {
    selectedCount: number;
    onClearSelection: () => void;
    onOpenTagsModal: () => void;
    onOpenDatesModal: () => void;
    onOpenMoveModal: () => void;
    onOpenExportModal: () => void;
    onDelete: () => void;
  }) => (
    <div data-testid="toolbar" data-selected-count={selectedCount}>
      <button type="button" onClick={onClearSelection}>
        Clear
      </button>
      <button type="button" onClick={onOpenTagsModal}>
        Tags
      </button>
      <button type="button" onClick={onOpenDatesModal}>
        Dates
      </button>
      <button type="button" onClick={onOpenMoveModal}>
        Move
      </button>
      <button type="button" onClick={onOpenExportModal}>
        Export
      </button>
      <button type="button" onClick={onDelete}>
        Delete
      </button>
    </div>
  ),
}));

vi.mock('$components/header/TaskBatchActionsBar/TaskBatchActionMenus', () => ({
  TaskBatchActionMenus: () => <output data-testid="menus" />,
}));

vi.mock('$components/header/TaskBatchActionsBar/TaskBatchActionModals', () => ({
  TaskBatchActionModals: () => <output data-testid="modals" />,
}));

describe('TaskBatchActionsBar', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    mocks.openTagsModal.mockReset();
    mocks.openDatesModal.mockReset();
    mocks.openMoveModal.mockReset();
    mocks.openExportModal.mockReset();
    mocks.handleDelete.mockReset();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('does not render when there is no selection', () => {
    act(() => {
      root.render(<TaskBatchActionsBar selectedTasks={[]} onClearSelection={vi.fn()} />);
    });

    expect(container.querySelector('[data-testid="toolbar"]')).toBeNull();
  });

  it('wires toolbar commands and overlay mounting for a selection', () => {
    act(() => {
      root.render(
        <TaskBatchActionsBar
          selectedTasks={[makeTask({ id: 'task-1' }), makeTask({ id: 'task-2' })]}
          onClearSelection={mocks.onClearSelection}
          mode="deleted"
        />,
      );
    });

    expect(
      container.querySelector('[data-testid="toolbar"]')?.getAttribute('data-selected-count'),
    ).toBe('2');
    expect(container.querySelector('[data-testid="menus"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="modals"]')).not.toBeNull();

    for (const label of ['Tags', 'Dates', 'Move', 'Export']) {
      act(() => {
        Array.from(container.querySelectorAll('button'))
          .find((button) => button.textContent === label)
          ?.click();
      });
    }
    act(() => container.querySelector('button')?.click());
    act(() =>
      Array.from(container.querySelectorAll('button'))
        .find((button) => button.textContent === 'Delete')
        ?.click(),
    );

    expect(mocks.openTagsModal).toHaveBeenCalledOnce();
    expect(mocks.openDatesModal).toHaveBeenCalledOnce();
    expect(mocks.openMoveModal).toHaveBeenCalledOnce();
    expect(mocks.openExportModal).toHaveBeenCalledOnce();
    expect(mocks.onClearSelection).toHaveBeenCalledOnce();
    expect(mocks.handleDelete).toHaveBeenCalledOnce();
  });
});
