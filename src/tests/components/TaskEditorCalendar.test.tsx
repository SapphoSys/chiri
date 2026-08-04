import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskEditorCalendar } from '$components/taskEditor/TaskEditorCalendar';
import type { Account } from '$types/account';
import { makeCalendar, makeTask } from '../fixtures';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('$hooks/ui/useResolvedAccentColor', () => ({
  useAccentColorResolver: () => (color: string) => color,
  useResolvedAccentColor: () => '#6366f1',
}));

const account: Account = {
  id: 'test-account',
  name: 'Personal',
  calendars: [makeCalendar({ id: 'test-calendar', accountId: 'test-account' })],
  isActive: true,
  sortOrder: 0,
  caldav: null,
};

describe('TaskEditorCalendar', () => {
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

  it('keeps the calendar heading separate from the calendar picker button', async () => {
    const onOpenMoveCalendar = vi.fn();

    await act(async () => {
      root.render(
        <TaskEditorCalendar
          task={makeTask({ accountId: 'test-account', calendarId: 'test-calendar' })}
          accounts={[account]}
          onOpenMoveCalendar={onOpenMoveCalendar}
        />,
      );
    });

    const heading = container.querySelector<HTMLDivElement>('#task-calendar-label');
    const pickerButton = container.querySelector<HTMLButtonElement>('#task-calendar');

    expect(heading?.tagName).toBe('DIV');
    expect(pickerButton?.getAttribute('aria-labelledby')).toBe('task-calendar-label');

    await act(async () => heading?.click());
    expect(onOpenMoveCalendar).not.toHaveBeenCalled();

    await act(async () => pickerButton?.click());
    expect(onOpenMoveCalendar).toHaveBeenCalledOnce();
  });
});
