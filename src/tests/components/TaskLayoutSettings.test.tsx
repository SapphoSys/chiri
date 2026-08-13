import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BadgesSettings } from '$components/settings/BadgesSettings/BadgesSettings';
import { EditorSettings } from '$components/settings/EditorSettings/EditorSettings';
import { TaskListLayoutSettings } from '$components/settings/TaskListLayoutSettings/TaskListLayoutSettings';
import { defaultState } from '$context/settingsDefaults';

const mockSetEditorFieldVisibility = vi.fn();
const mockSetEditorFieldOrder = vi.fn();
const mockSetTaskBadgeVisibility = vi.fn();
const mockSetTaskBadgeOrder = vi.fn();
const mockSetTaskTitleLines = vi.fn();

const mockStore = {
  editorFieldVisibility: { ...defaultState.editorFieldVisibility },
  editorFieldOrder: [...defaultState.editorFieldOrder],
  setEditorFieldVisibility: mockSetEditorFieldVisibility,
  setEditorFieldOrder: mockSetEditorFieldOrder,
  taskBadgeVisibility: { ...defaultState.taskBadgeVisibility },
  taskBadgeOrder: [...defaultState.taskBadgeOrder],
  setTaskBadgeVisibility: mockSetTaskBadgeVisibility,
  setTaskBadgeOrder: mockSetTaskBadgeOrder,
  taskListDensity: defaultState.taskListDensity,
  setTaskListDensity: vi.fn(),
  taskTitleLines: defaultState.taskTitleLines,
  setTaskTitleLines: mockSetTaskTitleLines,
};

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => mockStore,
}));

vi.mock('$components/settings/EditorSettings/EditorSettingsSortableFields', () => ({
  EditorSettingsSortableFields: ({ field }: { field: { key: string } }) => (
    <div data-testid={`editor-field-${field.key}`} />
  ),
}));

vi.mock('$components/settings/BadgesSettings/BadgesSettingsSortableBadges', () => ({
  BadgesSettingsSortableBadges: ({ badge }: { badge: { key: string } }) => (
    <div data-testid={`badge-${badge.key}`} />
  ),
}));

vi.mock('$components/settings/BadgesSettings/BadgesSettingsPreview', () => ({
  BadgesSettingsPreview: () => <div data-testid="badge-preview" />,
}));

vi.mock('@dnd-kit/core', () => ({
  closestCenter: vi.fn(),
  DndContext: ({ children }: { children: ReactNode }) => children,
  PointerSensor: class PointerSensor {},
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: (items: unknown[], from: number, to: number) => {
    const result = [...items];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
  },
  SortableContext: ({ children }: { children: ReactNode }) => children,
  verticalListSortingStrategy: {},
}));

describe('task layout settings resets', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.editorFieldVisibility = { ...defaultState.editorFieldVisibility };
    mockStore.editorFieldOrder = [...defaultState.editorFieldOrder];
    mockStore.taskBadgeVisibility = { ...defaultState.taskBadgeVisibility };
    mockStore.taskBadgeOrder = [...defaultState.taskBadgeOrder];
    mockStore.taskTitleLines = defaultState.taskTitleLines;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('shows an editor reset only when visibility or order has changed', async () => {
    await act(async () => root.render(<EditorSettings />));
    expect(container.querySelector('button')).toBeNull();

    mockStore.editorFieldVisibility = { ...mockStore.editorFieldVisibility, status: false };
    mockStore.editorFieldOrder = [
      'progress',
      ...defaultState.editorFieldOrder.filter((key) => key !== 'progress'),
    ];
    await act(async () => root.render(<EditorSettings />));

    const resetButton = container.querySelector('button');
    expect(resetButton?.textContent).toContain('Reset');
    await act(async () => resetButton?.click());

    expect(mockSetEditorFieldVisibility).toHaveBeenCalledWith(defaultState.editorFieldVisibility);
    expect(mockSetEditorFieldOrder).toHaveBeenCalledWith(defaultState.editorFieldOrder);
  });

  it('shows a badge reset only when visibility or order has changed', async () => {
    await act(async () => root.render(<BadgesSettings />));
    expect(container.querySelector('button')).toBeNull();

    mockStore.taskBadgeVisibility = { ...mockStore.taskBadgeVisibility, tags: false };
    mockStore.taskBadgeOrder = [
      'repeat',
      ...defaultState.taskBadgeOrder.filter((key) => key !== 'repeat'),
    ];
    await act(async () => root.render(<BadgesSettings />));

    const resetButton = container.querySelector('button');
    expect(resetButton?.textContent).toContain('Reset');
    await act(async () => resetButton?.click());

    expect(mockSetTaskBadgeVisibility).toHaveBeenCalledWith(defaultState.taskBadgeVisibility);
    expect(mockSetTaskBadgeOrder).toHaveBeenCalledWith(defaultState.taskBadgeOrder);
  });

  it('updates the task title wrapping setting', async () => {
    await act(async () => root.render(<TaskListLayoutSettings />));

    const multipleLinesButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Multiple lines',
    );
    expect(multipleLinesButton).toBeDefined();

    await act(async () => multipleLinesButton?.click());
    expect(mockSetTaskTitleLines).toHaveBeenCalledWith('multiple');
  });
});
