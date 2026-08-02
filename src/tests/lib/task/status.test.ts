import { describe, expect, it } from 'vitest';
import {
  buildProgressUpdates,
  buildStatusUpdates,
  getNewTaskPercentComplete,
  getTaskStatusAfterCompletionToggle,
} from '$lib/task/status';

const current = (percentComplete?: number, completedAt?: Date) => ({
  percentComplete,
  completedAt,
});

describe('buildStatusUpdates', () => {
  it('resets needs-action tasks to zero progress', () => {
    expect(buildStatusUpdates('needs-action', current(42))).toMatchObject({
      status: 'needs-action',
      completed: false,
      percentComplete: 0,
      completedAt: undefined,
    });
  });

  it('preserves valid progress when entering in-process', () => {
    expect(buildStatusUpdates('in-process', current(42))).toMatchObject({
      status: 'in-process',
      completed: false,
      percentComplete: 42,
      completedAt: undefined,
    });
  });

  it('starts in-process tasks at one percent when progress is invalid', () => {
    expect(buildStatusUpdates('in-process', current(0)).percentComplete).toBe(1);
    expect(buildStatusUpdates('in-process', current(100)).percentComplete).toBe(1);
    expect(buildStatusUpdates('in-process', current()).percentComplete).toBe(1);
  });

  it('sets completed tasks to 100 percent and records completion', () => {
    const now = new Date('2026-08-01T00:00:00.000Z');
    const updates = buildStatusUpdates('completed', current(42), now);

    expect(updates).toEqual({
      status: 'completed',
      completed: true,
      percentComplete: 100,
      completedAt: now,
    });
  });

  it('preserves progress when cancelling a task', () => {
    expect(buildStatusUpdates('cancelled', current(42))).toMatchObject({
      status: 'cancelled',
      completed: false,
      percentComplete: 42,
      completedAt: undefined,
    });
  });

  it('leaves progress unchanged when synchronization is disabled', () => {
    expect(buildStatusUpdates('completed', current(42), new Date(), false)).toEqual({
      status: 'completed',
      completed: true,
      completedAt: expect.any(Date),
    });
  });
});

describe('getTaskStatusAfterCompletionToggle', () => {
  it('completes in-process tasks when requested by the task editor', () => {
    expect(getTaskStatusAfterCompletionToggle('in-process', true)).toBe('completed');
  });

  it('keeps the existing toggle behavior by default', () => {
    expect(getTaskStatusAfterCompletionToggle('in-process')).toBe('needs-action');
    expect(getTaskStatusAfterCompletionToggle('completed')).toBe('needs-action');
    expect(getTaskStatusAfterCompletionToggle('needs-action')).toBe('completed');
  });
});

describe('buildProgressUpdates', () => {
  it('derives status and completion from progress', () => {
    expect(buildProgressUpdates(0, current())).toMatchObject({
      status: 'needs-action',
      completed: false,
      percentComplete: 0,
    });
    expect(buildProgressUpdates(42, current())).toMatchObject({
      status: 'in-process',
      completed: false,
      percentComplete: 42,
    });
    expect(buildProgressUpdates(100, current())).toMatchObject({
      status: 'completed',
      completed: true,
      percentComplete: 100,
    });
  });

  it('clamps progress to the supported range', () => {
    expect(buildProgressUpdates(-10, current()).percentComplete).toBe(0);
    expect(buildProgressUpdates(150, current()).percentComplete).toBe(100);
  });

  it('leaves status and completion unchanged when synchronization is disabled', () => {
    expect(buildProgressUpdates(42, current(), new Date(), false)).toEqual({
      percentComplete: 42,
    });
  });
});

describe('getNewTaskPercentComplete', () => {
  it('normalizes local tasks created from the configured defaults', () => {
    expect(getNewTaskPercentComplete(undefined, undefined, 'completed', 0)).toBe(100);
    expect(getNewTaskPercentComplete(undefined, undefined, 'in-process', 0)).toBe(1);
  });

  it('preserves explicit progress and imported task defaults', () => {
    expect(getNewTaskPercentComplete(undefined, 42, 'completed', 0)).toBe(42);
    expect(getNewTaskPercentComplete('completed', undefined, 'needs-action', 0)).toBe(0);
  });

  it('uses the configured default progress when synchronization is disabled', () => {
    expect(getNewTaskPercentComplete(undefined, undefined, 'completed', 0, false)).toBe(0);
  });
});
