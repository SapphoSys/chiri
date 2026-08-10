import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RepeatModal } from '$components/modals/RepeatModal/RepeatModal';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => ({
    dateFormat: 'MMM d, yyyy',
    startOfWeek: 'monday',
    workingDays: ['mo', 'tu', 'we', 'th', 'fr', 'su'],
  }),
  settingsStore: { getState: () => ({ dateFormat: 'MMM d, yyyy' }) },
}));

vi.mock('$components/ModalWrapper', () => ({
  ModalWrapper: ({
    children,
    footer,
    footerLeft,
  }: {
    children: ReactNode;
    footer?: ReactNode;
    footerLeft?: ReactNode;
  }) => (
    <div>
      {children}
      {footerLeft}
      {footer}
    </div>
  ),
}));

vi.mock('$components/modals/DatePickerModal', () => ({ DatePickerModal: () => null }));

describe('RepeatModal', () => {
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

  it('does not offer a remove option before a repeat exists', async () => {
    await act(async () => {
      root.render(
        <RepeatModal
          isOpen
          initialCustom
          onClose={vi.fn()}
          rrule={undefined}
          repeatFrom={0}
          onSave={vi.fn()}
        />,
      );
    });

    expect(container.textContent).not.toContain('Does not repeat');
    expect(container.textContent).not.toContain('Clear');
    expect(container.textContent).toContain('Custom…');
    expect(Array.from(container.querySelectorAll('option')).map((option) => option.value)).toEqual([
      'MINUTELY',
      'HOURLY',
      'DAILY',
      'WEEKLY',
      'MONTHLY',
      'YEARLY',
    ]);
  });

  it('builds an ordinal monthly weekday rule', async () => {
    const onSave = vi.fn();
    await act(async () => {
      root.render(
        <RepeatModal
          isOpen
          onClose={vi.fn()}
          rrule={undefined}
          repeatFrom={0}
          dueDate={new Date(2025, 0, 22, 12)}
          onSave={onSave}
        />,
      );
    });

    const button = (label: string) =>
      Array.from(container.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );
    await act(async () => button('Monthly')?.click());
    await act(async () => button('Weekday')?.click());

    const [ordinalSelect, weekdaySelect] = Array.from(container.querySelectorAll('select'));
    await act(async () => {
      ordinalSelect.value = '3';
      ordinalSelect.dispatchEvent(new Event('change', { bubbles: true }));
      weekdaySelect.value = 'MO';
      weekdaySelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await act(async () => button('Add')?.click());

    expect(onSave).toHaveBeenCalledWith('FREQ=MONTHLY;BYDAY=3MO', 0);
  });

  it('promotes daily and weekly presets to custom when their interval changes', async () => {
    const button = (label: string) =>
      Array.from(container.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    await act(async () => {
      root.render(
        <RepeatModal isOpen onClose={vi.fn()} rrule={undefined} repeatFrom={0} onSave={vi.fn()} />,
      );
    });

    const interval = () => container.querySelector<HTMLInputElement>('input[type="text"]');
    await act(async () => button('Daily')?.click());
    expect(button('Daily')?.getAttribute('aria-pressed')).toBe('true');
    await act(async () => {
      const input = interval();
      if (!input) throw new Error('interval input not found');
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      input.focus();
      setValue?.call(input, '2');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.blur();
    });
    expect(button('Custom…')?.getAttribute('aria-pressed')).toBe('true');

    await act(async () => button('Weekly')?.click());
    expect(button('Weekly')?.getAttribute('aria-pressed')).toBe('true');
    await act(async () => {
      const input = interval();
      if (!input) throw new Error('interval input not found');
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      input.focus();
      setValue?.call(input, '2');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.blur();
    });
    expect(button('Custom…')?.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('select')?.value).toBe('WEEKLY');
  });

  it('keeps configured weekdays selected when reopening their preview', async () => {
    await act(async () => {
      root.render(
        <RepeatModal
          isOpen
          onClose={vi.fn()}
          rrule="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SU"
          repeatFrom={0}
          onSave={vi.fn()}
        />,
      );
    });

    const button = (label: string) =>
      Array.from(container.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );

    expect(button('Weekdays')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('Weekly')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('preserves imported options unchanged and blocks unsafe visual edits', async () => {
    const onSave = vi.fn();
    const importedRule = 'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1';
    await act(async () => {
      root.render(
        <RepeatModal
          isOpen
          onClose={vi.fn()}
          rrule={importedRule}
          repeatFrom={0}
          onSave={onSave}
        />,
      );
    });

    expect(container.textContent).toContain('BYSETPOS');
    const edit = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Edit',
    );
    expect(edit?.hasAttribute('disabled')).toBe(true);

    const daily = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Daily',
    );
    await act(async () => daily?.click());
    expect(edit?.hasAttribute('disabled')).toBe(true);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'cannot be safely changed',
    );
  });

  it('allows ending-only edits while preserving hidden recurrence fields', async () => {
    const onSave = vi.fn();
    const importedRule = 'FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1;WKST=SU';
    await act(async () => {
      root.render(
        <RepeatModal
          isOpen
          onClose={vi.fn()}
          rrule={importedRule}
          repeatFrom={0}
          onSave={onSave}
        />,
      );
    });

    const button = (label: string) =>
      Array.from(container.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );
    await act(async () => button('After')?.click());

    const done = button('Edit');
    expect(done?.hasAttribute('disabled')).toBe(false);
    await act(async () => done?.click());
    expect(onSave).toHaveBeenCalledWith(`${importedRule};COUNT=5`, 0);
  });
});
