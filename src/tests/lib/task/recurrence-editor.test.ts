import { describe, expect, it } from 'vitest';
import { buildRepeatRRule, parseRepeatUIState } from '$lib/task/recurrence/editor';

describe('repeat rule editor conversions', () => {
  it('parses ordinal monthly rules into the visual editor state', () => {
    const state = parseRepeatUIState(
      'FREQ=MONTHLY;BYDAY=3MO;COUNT=5;UNTIL=20260101T000000Z',
      new Date(2025, 0, 22, 12),
    );

    expect(state).toMatchObject({
      freq: 'custom',
      monthlyMode: 'weekday',
      monthlyOrdinal: 3,
      monthlyWeekday: 'MO',
      endMode: 'count',
      count: 5,
      until: '2026-01-01',
    });
  });

  it('builds a monthly ordinal rule from visual editor state', () => {
    const initialState = parseRepeatUIState(undefined, new Date(2025, 0, 22, 12));
    const state = {
      ...initialState,
      freq: 'monthly' as const,
      monthlyMode: 'weekday' as const,
      monthlyOrdinal: 3,
      monthlyWeekday: 'MO',
    };

    expect(buildRepeatRRule(state)).toBe('FREQ=MONTHLY;BYDAY=3MO');
  });

  it('preserves hidden imported fields when only the ending changes', () => {
    const originalRule = 'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1;WKST=SU';
    const initialState = parseRepeatUIState(originalRule, new Date(2025, 0, 22, 12));
    const state = { ...initialState, endMode: 'count' as const, count: 5 };

    expect(buildRepeatRRule(state, originalRule, initialState)).toBe(`${originalRule};COUNT=5`);
  });

  it('clears the rule when the no-repeat frequency is selected', () => {
    const initialState = parseRepeatUIState('FREQ=DAILY');

    expect(buildRepeatRRule({ ...initialState, freq: 'none' })).toBeUndefined();
  });
});
