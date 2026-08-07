import { act, createElement, useSyncExternalStore } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDateTimePickerDraft } from '$hooks/ui/useDateTimePickerDraft';

const mockSettings = vi.hoisted(() => {
  const initialState = {
    dateFormat: 'MMM d, yyyy',
    startOfWeek: 'monday',
    quickTimePresets: {
      morning: 540,
      afternoon: 720,
      evening: 1020,
      night: 1260,
    },
    workingDays: ['mo', 'tu', 'we', 'th', 'fr'],
  };
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    store: {
      getState: () => state,
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      update: (updates: Record<string, unknown>) => {
        state = { ...state, ...updates };
        for (const listener of listeners) listener();
      },
      reset: () => {
        state = {
          dateFormat: 'MMM d, yyyy',
          startOfWeek: 'monday',
          quickTimePresets: {
            morning: 540,
            afternoon: 720,
            evening: 1020,
            night: 1260,
          },
          workingDays: ['mo', 'tu', 'we', 'th', 'fr'],
        };
      },
    },
  };
});

vi.mock('$context/settingsContext', () => ({
  settingsStore: mockSettings.store,
  useSettingsStore: () =>
    useSyncExternalStore(
      mockSettings.store.subscribe,
      mockSettings.store.getState,
      mockSettings.store.getState,
    ),
}));

vi.mock('$hooks/ui/useDatePickerKeyboardNavigation', () => ({
  useDatePickerKeyboardNavigation: () => undefined,
}));

const DraftProbe = ({ supportsNoTime }: { supportsNoTime: boolean }) => {
  const draft = useDateTimePickerDraft({
    isOpen: true,
    supportsNoTime,
  });

  return (
    <>
      <output
        data-state={JSON.stringify({
          daysOfWeek: draft.daysOfWeek,
          localNoTime: draft.localNoTime,
          nextWorkingDay: draft.nextWorkingDay.getDay(),
          quickTimePresets: draft.quickTimePresets,
          timeSelected: draft.timeSelected,
          selectedMinutes: draft.selectedMinutes,
          localHour: draft.localValue?.getHours() ?? null,
          selectedQuickDatePreset: draft.selectedQuickDatePreset ?? null,
        })}
      />
      <button
        type="button"
        data-action="select-day"
        onClick={() => draft.handleDayClick(new Date(2025, 0, 2))}
      />
      <button
        type="button"
        data-action="select-tomorrow"
        onClick={() => draft.handleQuickSelect(new Date(2025, 0, 2), 'tomorrow')}
      />
      <button
        type="button"
        data-action="select-next-working-day"
        onClick={() => draft.handleQuickSelect(new Date(2025, 0, 2), 'next-working-day')}
      />
    </>
  );
};

describe('useDateTimePickerDraft', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockSettings.store.reset();
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('keeps date-picker mode date-only until a time is selected', () => {
    act(() => root.render(createElement(DraftProbe, { supportsNoTime: true })));

    const output = container.querySelector('output');
    expect(JSON.parse(output?.dataset.state ?? '{}')).toMatchObject({
      localNoTime: true,
      timeSelected: false,
      selectedMinutes: 720,
      localHour: null,
    });

    act(() => container.querySelector<HTMLButtonElement>('[data-action="select-day"]')?.click());
    expect(JSON.parse(output?.dataset.state ?? '{}')).toMatchObject({
      localNoTime: true,
      localHour: 0,
    });
  });

  it('keeps reminder mode timed and uses the default time for a new date', () => {
    act(() => root.render(createElement(DraftProbe, { supportsNoTime: false })));

    const output = container.querySelector('output');
    expect(JSON.parse(output?.dataset.state ?? '{}')).toMatchObject({
      localNoTime: false,
      timeSelected: true,
      selectedMinutes: 720,
      localHour: null,
    });

    act(() => container.querySelector<HTMLButtonElement>('[data-action="select-day"]')?.click());
    expect(JSON.parse(output?.dataset.state ?? '{}')).toMatchObject({
      localNoTime: false,
      localHour: 12,
    });
  });

  it('tracks which matching quick date shortcut was explicitly selected', () => {
    act(() => root.render(createElement(DraftProbe, { supportsNoTime: true })));

    const output = container.querySelector('output');
    const getState = () => JSON.parse(output?.dataset.state ?? '{}');

    expect(getState()).toMatchObject({ selectedQuickDatePreset: null });

    act(() =>
      container.querySelector<HTMLButtonElement>('[data-action="select-tomorrow"]')?.click(),
    );
    expect(getState()).toMatchObject({ selectedQuickDatePreset: 'tomorrow' });

    act(() =>
      container
        .querySelector<HTMLButtonElement>('[data-action="select-next-working-day"]')
        ?.click(),
    );
    expect(getState()).toMatchObject({ selectedQuickDatePreset: 'next-working-day' });

    act(() => container.querySelector<HTMLButtonElement>('[data-action="select-day"]')?.click());
    expect(getState()).toMatchObject({ selectedQuickDatePreset: null });
  });

  it('updates derived calendar settings while the picker is open', () => {
    act(() => root.render(createElement(DraftProbe, { supportsNoTime: true })));

    const output = container.querySelector('output');
    expect(JSON.parse(output?.dataset.state ?? '{}')).toMatchObject({
      daysOfWeek: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      nextWorkingDay: expect.any(Number),
      quickTimePresets: expect.objectContaining({ morning: 540 }),
    });

    act(() => {
      mockSettings.store.update({
        startOfWeek: 'sunday',
        quickTimePresets: {
          morning: 600,
          afternoon: 780,
          evening: 1080,
          night: 1320,
        },
        workingDays: ['sa'],
      });
    });

    expect(JSON.parse(output?.dataset.state ?? '{}')).toMatchObject({
      daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      nextWorkingDay: 6,
      quickTimePresets: expect.objectContaining({ morning: 600 }),
    });
  });
});
