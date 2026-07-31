import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDateTimePickerDraft } from '$hooks/ui/useDateTimePickerDraft';

vi.mock('$context/settingsContext', () => ({
  settingsStore: {
    getState: () => ({
      dateFormat: 'MMM d, yyyy',
      startOfWeek: 'monday',
      quickTimePresets: {
        morning: 540,
        afternoon: 720,
        evening: 1020,
        night: 1260,
      },
      workingDays: ['mo', 'tu', 'we', 'th', 'fr'],
    }),
  },
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
          localNoTime: draft.localNoTime,
          timeSelected: draft.timeSelected,
          selectedMinutes: draft.selectedMinutes,
          localHour: draft.localValue?.getHours() ?? null,
        })}
      />
      <button
        type="button"
        data-action="select-day"
        onClick={() => draft.handleDayClick(new Date(2025, 0, 2))}
      />
    </>
  );
};

describe('useDateTimePickerDraft', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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
});
