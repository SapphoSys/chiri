import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskItemRepeatBadge } from '$components/taskItem/badges/TaskItemRepeatBadge';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('TaskItemRepeatBadge', () => {
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

  it('acts as an editor shortcut without triggering the task row', async () => {
    const onClick = vi.fn();
    const onRowClick = vi.fn();

    await act(async () => {
      root.render(
        // biome-ignore lint/a11y/useSemanticElements: mirrors the interactive task-row container around this badge
        <div role="button" tabIndex={0} onClick={onRowClick} onKeyDown={vi.fn()}>
          <TaskItemRepeatBadge rrule="FREQ=WEEKLY;BYDAY=WE" onClick={onClick} />
        </div>,
      );
    });

    const badge = container.querySelector<HTMLButtonElement>('button');
    expect(badge?.getAttribute('aria-label')).toContain('Edit repeat rule: Weekly on Wed');

    await act(async () => badge?.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('stays non-interactive when no click action is available', async () => {
    await act(async () => {
      root.render(<TaskItemRepeatBadge rrule="FREQ=DAILY" />);
    });

    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('span')?.textContent).toContain('Daily');
  });
});
