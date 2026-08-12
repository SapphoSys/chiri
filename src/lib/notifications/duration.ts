import type { SnoozeDuration, SnoozeDurationUnit } from '$types/notifications/settings';

const SECONDS_PER_UNIT: Record<SnoozeDurationUnit, number> = {
  seconds: 1,
  minutes: 60,
  hours: 60 * 60,
  days: 60 * 60 * 24,
  weeks: 60 * 60 * 24 * 7,
};

// keep snooze durations useful while ensuring they stay well within the native u32 limit
export const MAX_SNOOZE_DURATION_SECONDS = 365 * 24 * 60 * 60;

export const SNOOZE_DURATION_UNITS: Array<{ value: SnoozeDurationUnit; label: string }> = [
  { value: 'seconds', label: 'seconds' },
  { value: 'minutes', label: 'minutes' },
  { value: 'hours', label: 'hours' },
  { value: 'days', label: 'days' },
  { value: 'weeks', label: 'weeks' },
];

export const getMaxSnoozeDurationValue = (unit: SnoozeDurationUnit) =>
  Math.floor(MAX_SNOOZE_DURATION_SECONDS / SECONDS_PER_UNIT[unit]);

export const clampSnoozeDurationValue = (value: number, unit: SnoozeDurationUnit) => {
  const normalizedValue = Number.isFinite(value) ? Math.trunc(value) : 1;
  return Math.min(Math.max(normalizedValue, 1), getMaxSnoozeDurationValue(unit));
};

export const snoozeDurationToSeconds = (duration: SnoozeDuration): number => {
  return clampSnoozeDurationValue(duration.value, duration.unit) * SECONDS_PER_UNIT[duration.unit];
};

export const secondsToSnoozeDuration = (totalSeconds: number): SnoozeDuration => {
  if (totalSeconds === 0) {
    return { id: crypto.randomUUID(), value: 0, unit: 'minutes' };
  }

  for (const unit of ['weeks', 'days', 'hours', 'minutes', 'seconds'] as SnoozeDurationUnit[]) {
    const factor = SECONDS_PER_UNIT[unit];
    if (totalSeconds % factor === 0) {
      return {
        id: crypto.randomUUID(),
        value: totalSeconds / factor,
        unit,
      };
    }
  }

  return {
    id: crypto.randomUUID(),
    value: totalSeconds,
    unit: 'seconds',
  };
};
