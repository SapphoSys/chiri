import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskItemBadge } from '$components/taskItem/badges/TaskItemBadge';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('TaskItemBadge', () => {
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

  it('keeps dynamic color on the border and background only', async () => {
    await act(async () => {
      root.render(createElement(TaskItemBadge, { color: '#3b82f6' }, 'Home'));
    });

    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain('text-surface-700');
    expect(badge.className).toContain('dark:text-surface-300');
    expect(badge.className).not.toContain('text-primary');
    expect(badge.style.borderColor).toBe('rgb(59, 130, 246)');
    expect(badge.style.getPropertyValue('--task-item-badge-background')).toBe(
      'color-mix(in oklab, #3b82f6 15%, transparent)',
    );
    expect(badge.style.getPropertyValue('--task-item-badge-hover-background')).toBe(
      'color-mix(in oklab, #3b82f6 25%, transparent)',
    );
  });

  it('uses the shared tone classes for semantic badges', async () => {
    await act(async () => {
      root.render(createElement(TaskItemBadge, { tone: 'due-today' }, 'Today'));
    });

    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain('border-semantic-due-today');
    expect(badge.className).toContain('bg-semantic-due-today/10');
    expect(badge.className).not.toContain('text-semantic-due-today');
  });

  it('keeps informational, warning, and in-process tones visually distinct', async () => {
    await act(async () => {
      root.render(
        createElement(
          'div',
          null,
          createElement(TaskItemBadge, { tone: 'info' }, 'Snoozed'),
          createElement(TaskItemBadge, { tone: 'warning' }, 'Warning'),
          createElement(TaskItemBadge, { tone: 'in-process' }, '50%'),
        ),
      );
    });

    const badges = Array.from(container.firstElementChild?.children ?? []) as HTMLElement[];
    expect(badges[0].className).toContain('border-semantic-info');
    expect(badges[1].className).toContain('border-semantic-warning');
    expect(badges[2].className).toContain('border-status-in-process');
    expect(badges[0].className).not.toBe(badges[1].className);
    expect(badges[1].className).not.toBe(badges[2].className);
  });

  it('preserves button behavior for interactive badges', async () => {
    const onClick = vi.fn();

    await act(async () => {
      root.render(createElement(TaskItemBadge, { onClick }, 'Home'));
    });

    const badge = container.querySelector('button');
    expect(badge).not.toBeNull();

    await act(async () => badge?.click());
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not animate the whole badge through opacity on hover', async () => {
    await act(async () => {
      root.render(createElement(TaskItemBadge, { onClick: vi.fn() }, 'Home'));
    });

    const badge = container.querySelector('button');
    expect(badge?.className).toContain('task-item-badge-interactive');
    expect(badge?.className).toContain('transition-colors');
    expect(badge?.className).not.toContain('transition-opacity');
    expect(badge?.className).not.toContain('hover:opacity-80');
  });

  it('uses the shared tooltip instead of a native title when provided', async () => {
    await act(async () => {
      root.render(
        createElement(TaskItemBadge, { title: 'Native title', tooltip: 'Open link' }, 'URL'),
      );
    });

    const badge = container.querySelector('[data-tooltip-trigger] > span');
    expect(badge?.getAttribute('title')).toBeNull();
    expect(badge?.getAttribute('aria-describedby')).toBeTruthy();
  });
});
