import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDueDate } from '$utils/date';

vi.mock('$context/settingsContext', () => ({
  settingsStore: {
    getState: () => ({ dateFormat: 'MMM d, yyyy', timeFormat: '24' }),
  },
}));

describe('formatDueDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 13, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('marks every date before today as overdue, including dates earlier in the current week', () => {
    const dueDates = Array.from({ length: 7 }, (_, index) => new Date(2026, 7, index + 6, 0, 0, 0));

    expect(dueDates.map((date) => formatDueDate(date).tone)).toEqual([
      'error',
      'error',
      'error',
      'error',
      'error',
      'error',
      'error',
    ]);
  });
});
