import { addDays, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { settingsStore } from '$context/settingsContext';
import { type DateTimePickerState, useDateTimePickerState } from '$hooks/ui/useDateTimePickerState';
import type { QuickTimePresets } from '$types/settings/categories/scheduling';
import {
  getDaysOfWeekLabels,
  getMonthStartPadding,
  getNextWorkingDay,
  getWeekStartValue,
} from '$utils/calendar';
import { formatDate, formatTime } from '$utils/date';

export type { PickerTime } from '$hooks/ui/useDateTimePickerState';

export type DateTimePickerDraft = DateTimePickerState & {
  quickTimePresets: QuickTimePresets;
  daysOfWeek: readonly string[];
  days: Date[];
  startPadding: number;
  today: Date;
  nextWorkingDay: Date;
  selectedMinutes: number;
  isCustomTime: boolean;
  isQuickToday: boolean;
  isQuickTomorrow: boolean;
  isQuickNextWorkingDay: boolean;
  isQuickNextWeek: boolean;
  selectedDateLabel: string | null;
  selectedTimeLabel: string | null;
  hasChanges: boolean;
};

interface UseDateTimePickerDraftOptions {
  isOpen: boolean;
  value?: Date;
  supportsNoTime: boolean;
  allDay?: boolean;
  resetMonthOnOpen?: boolean;
}

const DEFAULT_QUICK_TIME_PRESETS: QuickTimePresets = {
  morning: 540,
  afternoon: 720,
  evening: 1020,
  night: 1260,
};

const QUICK_TIME_PRESET_IDS: (keyof QuickTimePresets)[] = [
  'morning',
  'afternoon',
  'evening',
  'night',
];

const isTimeCustom = (
  timeSelected: boolean,
  localNoTime: boolean,
  selectedMinutes: number,
  quickTimePresets: QuickTimePresets,
) => {
  if (!timeSelected || localNoTime) return false;
  return !QUICK_TIME_PRESET_IDS.some((id) => quickTimePresets[id] === selectedMinutes);
};

export const useDateTimePickerDraft = ({
  isOpen,
  value,
  supportsNoTime,
  allDay = false,
  resetMonthOnOpen = false,
}: UseDateTimePickerDraftOptions): DateTimePickerDraft => {
  const state = useDateTimePickerState({
    isOpen,
    value,
    supportsNoTime,
    allDay,
    resetMonthOnOpen,
  });
  const {
    startOfWeek: weekStartsSetting,
    quickTimePresets: storedPresets,
    workingDays,
  } = settingsStore.getState();
  const quickTimePresets =
    storedPresets && !Array.isArray(storedPresets) ? storedPresets : DEFAULT_QUICK_TIME_PRESETS;
  const weekStartsOn = getWeekStartValue(weekStartsSetting);
  const monthStart = startOfMonth(state.currentMonth);
  const today = new Date();
  const nextWorkingDay = getNextWorkingDay(today, workingDays);
  const selectedMinutes = state.selectedTime.hours * 60 + state.selectedTime.minutes;
  const selectedDateLabel = state.localValue
    ? `${format(state.localValue, 'EEEE')}, ${formatDate(state.localValue, true)}`
    : null;
  const selectedTimeLabel =
    state.localValue && !state.localNoTime && state.timeSelected
      ? formatTime(state.localValue)
      : null;
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(state.currentMonth) });
  const startPadding = getMonthStartPadding(monthStart.getDay(), weekStartsOn);
  const hasChanges =
    state.localValue === undefined && state.initialValue === undefined
      ? false
      : state.localValue === undefined || state.initialValue === undefined
        ? true
        : state.localValue.getTime() !== state.initialValue.getTime();
  const derivedState = useMemo(
    () => ({
      daysOfWeek: getDaysOfWeekLabels(weekStartsOn),
      days,
      startPadding,
      today,
      nextWorkingDay,
      selectedMinutes,
      isCustomTime: isTimeCustom(
        state.timeSelected,
        state.localNoTime,
        selectedMinutes,
        quickTimePresets,
      ),
      isQuickToday: state.localValue ? isSameDay(state.localValue, today) : false,
      isQuickTomorrow: state.localValue ? isSameDay(state.localValue, addDays(today, 1)) : false,
      isQuickNextWorkingDay: state.localValue ? isSameDay(state.localValue, nextWorkingDay) : false,
      isQuickNextWeek: state.localValue ? isSameDay(state.localValue, addDays(today, 7)) : false,
      selectedDateLabel,
      selectedTimeLabel,
      hasChanges,
    }),
    [
      days,
      hasChanges,
      nextWorkingDay,
      quickTimePresets,
      selectedDateLabel,
      selectedMinutes,
      selectedTimeLabel,
      startPadding,
      state.localNoTime,
      state.localValue,
      state.timeSelected,
      today,
      weekStartsOn,
    ],
  );

  return { ...state, quickTimePresets, ...derivedState };
};
