import { describe, expect, it } from 'vitest';
import {
  clampSnoozeDurationValue,
  getMaxSnoozeDurationValue,
  MAX_SNOOZE_DURATION_SECONDS,
  snoozeDurationToSeconds,
} from '$lib/notifications/duration';

describe('snooze duration limits', () => {
  it('limits every unit to at most one year', () => {
    expect(getMaxSnoozeDurationValue('seconds')).toBe(MAX_SNOOZE_DURATION_SECONDS);
    expect(getMaxSnoozeDurationValue('days')).toBe(365);
    expect(getMaxSnoozeDurationValue('weeks')).toBe(52);
  });

  it('clamps values before converting them to seconds', () => {
    expect(clampSnoozeDurationValue(0, 'minutes')).toBe(1);
    expect(clampSnoozeDurationValue(Number.MAX_SAFE_INTEGER, 'days')).toBe(365);
    expect(
      snoozeDurationToSeconds({ id: 'too-long', value: Number.MAX_SAFE_INTEGER, unit: 'weeks' }),
    ).toBe(52 * 7 * 24 * 60 * 60);
  });
});
