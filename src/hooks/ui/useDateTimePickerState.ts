import { addMonths, subMonths } from 'date-fns';
import type { PointerEvent, RefObject } from 'react';
import { useRef, useState } from 'react';
import { DEFAULT_TIME } from '$constants';
import { useDatePickerKeyboardNavigation } from '$hooks/ui/useDatePickerKeyboardNavigation';
import { createAllDayDate, setDateTime } from '$utils/calendar';

export interface PickerTime {
  hours: number;
  minutes: number;
}

export type QuickDatePreset = 'today' | 'tomorrow' | 'next-working-day' | 'next-week';

export interface DateTimePickerState {
  currentMonth: Date;
  localValue: Date | undefined;
  initialValue: Date | undefined;
  selectedTime: PickerTime;
  localNoTime: boolean;
  timeSelected: boolean;
  supportsNoTime: boolean;
  showCustomModal: boolean;
  customHour: number;
  customMinute: number;
  closeCustomModal: () => void;
  presetListRef: RefObject<HTMLDivElement | null>;
  calendarGridAreaRef: RefObject<HTMLDivElement | null>;
  handleDayClick: (day: Date) => void;
  handleCalendarGridAreaPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  handlePresetTimeSelect: (minutes: number) => void;
  handleNoTimeToggle: () => void;
  handleQuickSelect: (date: Date, preset: QuickDatePreset) => void;
  selectedQuickDatePreset: QuickDatePreset | undefined;
  handleOpenCustomModal: () => void;
  handleCustomTimeConfirm: (hour: number, minute: number) => void;
  clearLocalValue: () => void;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
}

interface UseDateTimePickerStateOptions {
  isOpen: boolean;
  value?: Date;
  supportsNoTime: boolean;
  allDay: boolean;
  resetMonthOnOpen: boolean;
}

const getSelectedTime = (value: Date | undefined, supportsNoTime: boolean, allDay: boolean) => {
  if (value && (!supportsNoTime || !allDay)) {
    return { hours: value.getHours(), minutes: value.getMinutes() };
  }
  return DEFAULT_TIME;
};

export const useDateTimePickerState = ({
  isOpen,
  value,
  supportsNoTime,
  allDay,
  resetMonthOnOpen,
}: UseDateTimePickerStateOptions): DateTimePickerState => {
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [localValue, setLocalValue] = useState<Date | undefined>(value);
  const [initialValue, setInitialValue] = useState<Date | undefined>(value);
  const [selectedTime, setSelectedTime] = useState(() =>
    getSelectedTime(value, supportsNoTime, allDay),
  );
  const [localNoTime, setLocalNoTime] = useState(supportsNoTime && (!value || allDay));
  const [timeSelected, setTimeSelected] = useState(supportsNoTime ? !!value && !allDay : true);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customHour, setCustomHour] = useState(0);
  const [customMinute, setCustomMinute] = useState(0);
  const [selectedQuickDatePreset, setSelectedQuickDatePreset] = useState<
    QuickDatePreset | undefined
  >();
  const presetListRef = useRef<HTMLDivElement>(null);
  const calendarGridAreaRef = useRef<HTMLDivElement>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setLocalValue(value);
      setInitialValue(value);
      setLocalNoTime(supportsNoTime && (!value || allDay));
      setTimeSelected(supportsNoTime ? !!value && !allDay : true);
      setSelectedTime(getSelectedTime(value, supportsNoTime, allDay));
      setShowCustomModal(false);
      setSelectedQuickDatePreset(undefined);
      if (resetMonthOnOpen) {
        setCurrentMonth(value ? new Date(value) : new Date());
      }
    }
  }

  useDatePickerKeyboardNavigation({
    enabled: isOpen && !showCustomModal,
    presetListRef,
    calendarGridRef: calendarGridAreaRef,
    currentMonth,
    preferredDate: localValue,
    onPreviousMonth: () => setCurrentMonth((month) => subMonths(month, 1)),
    onNextMonth: () => setCurrentMonth((month) => addMonths(month, 1)),
    onCalendarMonthChange: setCurrentMonth,
  });

  const handleDayClick = (day: Date) => {
    setSelectedQuickDatePreset(undefined);
    setLocalValue(
      localNoTime
        ? createAllDayDate(day)
        : setDateTime(day, selectedTime.hours, selectedTime.minutes),
    );
  };

  const handleCalendarGridAreaPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest('button')) return;
    event.currentTarget.focus({ preventScroll: true });
  };

  const handlePresetTimeSelect = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    setSelectedTime({ hours, minutes: mins });
    setLocalNoTime(false);
    setTimeSelected(true);
    if (localValue !== undefined) {
      setLocalValue(setDateTime(localValue, hours, mins));
    }
  };

  const handleNoTimeToggle = () => {
    if (!supportsNoTime) return;
    const next = !localNoTime;
    setLocalNoTime(next);
    if (localValue) {
      setLocalValue(
        next
          ? createAllDayDate(localValue)
          : setDateTime(localValue, selectedTime.hours, selectedTime.minutes),
      );
    }
  };

  const handleQuickSelect = (date: Date, preset: QuickDatePreset) => {
    setSelectedQuickDatePreset(preset);
    setLocalValue(
      localNoTime
        ? createAllDayDate(date)
        : setDateTime(date, selectedTime.hours, selectedTime.minutes),
    );
    setCurrentMonth(date);
  };

  const handleOpenCustomModal = () => {
    const oneHourLater = new Date(Date.now() + 60 * 60 * 1000);
    setCustomHour(oneHourLater.getHours());
    setCustomMinute(oneHourLater.getMinutes());
    setShowCustomModal(true);
  };

  const handleCustomTimeConfirm = (hour: number, minute: number) => {
    const newTime = { hours: hour, minutes: minute };
    setSelectedTime(newTime);
    setLocalNoTime(false);
    setTimeSelected(true);
    if (localValue !== undefined) {
      setLocalValue(setDateTime(localValue, hour, minute));
    }
    setShowCustomModal(false);
  };

  return {
    currentMonth,
    localValue,
    initialValue,
    selectedTime,
    localNoTime,
    timeSelected,
    supportsNoTime,
    showCustomModal,
    customHour,
    customMinute,
    closeCustomModal: () => setShowCustomModal(false),
    presetListRef,
    calendarGridAreaRef,
    handleDayClick,
    handleCalendarGridAreaPointerDown,
    handlePresetTimeSelect,
    handleNoTimeToggle,
    handleQuickSelect,
    selectedQuickDatePreset,
    handleOpenCustomModal,
    handleCustomTimeConfirm,
    clearLocalValue: () => {
      setSelectedQuickDatePreset(undefined);
      setLocalValue(undefined);
    },
    handlePreviousMonth: () => setCurrentMonth((month) => subMonths(month, 1)),
    handleNextMonth: () => setCurrentMonth((month) => addMonths(month, 1)),
  };
};
