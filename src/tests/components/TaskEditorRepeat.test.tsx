import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskEditorRepeat } from '$components/taskEditor/TaskEditorRepeat';
import { makeTask } from '../fixtures';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => ({ dateFormat: 'MMM d, yyyy' }),
  settingsStore: {
    getState: () => ({ dateFormat: 'MMM d, yyyy' }),
  },
}));

vi.mock('$components/FloatingDropdownFrame', () => ({
  FloatingDropdownFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TaskEditorRepeat', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('offers contextual presets from the compact empty state', async () => {
    const onSetPreset = vi.fn();
    const task = makeTask({ dueDate: new Date(2025, 0, 22) });

    await act(async () => {
      root.render(
        <TaskEditorRepeat
          task={task}
          onOpen={vi.fn()}
          onOpenCustom={vi.fn()}
          onSetPreset={onSetPreset}
        />,
      );
    });

    const addButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Add repeat rule',
    );
    await act(async () => addButton?.click());

    const weeklyButton = Array.from(container.querySelectorAll('[role="menuitem"]')).find(
      (button) => button.textContent?.trim() === 'Weekly on Wednesday',
    ) as HTMLButtonElement | undefined;
    expect(weeklyButton).toBeTruthy();

    await act(async () => weeklyButton?.click());
    expect(onSetPreset).toHaveBeenCalledWith('FREQ=WEEKLY;BYDAY=WE');
  });

  it('opens the custom builder from the preset menu', async () => {
    const onOpenCustom = vi.fn();

    await act(async () => {
      root.render(
        <TaskEditorRepeat
          task={makeTask()}
          onOpen={vi.fn()}
          onOpenCustom={onOpenCustom}
          onSetPreset={vi.fn()}
        />,
      );
    });

    const addButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Add repeat rule',
    );
    await act(async () => addButton?.click());
    const customButton = Array.from(container.querySelectorAll('[role="menuitem"]')).find(
      (button) => button.textContent?.trim() === 'Custom…',
    ) as HTMLButtonElement | undefined;
    await act(async () => customButton?.click());

    expect(onOpenCustom).toHaveBeenCalledOnce();
  });

  it('shows the following scheduled occurrence and opens the repeat editor', async () => {
    const onOpen = vi.fn();
    const task = makeTask({
      dueDate: new Date(2025, 0, 22, 12),
      rrule: 'FREQ=WEEKLY;BYDAY=WE',
      repeatFrom: 0,
    });

    await act(async () => {
      root.render(
        <TaskEditorRepeat
          task={task}
          onOpen={onOpen}
          onOpenCustom={vi.fn()}
          onSetPreset={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain('Then: Jan 29, 2025');
    expect(container.querySelector('[aria-label="Remove repeat rule"]')).toBeNull();
    await act(async () =>
      container.querySelector<HTMLButtonElement>('button[title^="Repeat:"]')?.click(),
    );
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('does not promise a fixed date for completion-relative repeats', async () => {
    const task = makeTask({
      dueDate: new Date(2025, 0, 22, 12),
      rrule: 'FREQ=WEEKLY;BYDAY=WE',
      repeatFrom: 1,
    });

    await act(async () => {
      root.render(
        <TaskEditorRepeat
          task={task}
          onOpen={vi.fn()}
          onOpenCustom={vi.fn()}
          onSetPreset={vi.fn()}
        />,
      );
    });

    expect(container.textContent).toContain('Next date depends on completion');
    expect(container.textContent).not.toContain('Then:');
    const description = Array.from(container.querySelectorAll('span')).find(
      (element) => element.textContent === 'Next date depends on completion',
    );
    expect(description?.className).toContain('whitespace-nowrap');
    expect(description?.className.split(/\s+/)).toContain('group-hover:truncate');
    expect(description?.className.split(/\s+/)).not.toContain('truncate');
  });
});
