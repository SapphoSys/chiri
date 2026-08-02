import type { ReactNode } from 'react';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DatePickerModal } from '$components/modals/DatePickerModal';
import { ReminderPickerModal } from '$components/modals/ReminderPickerModal';

const mocks = vi.hoisted(() => {
  const selectedDate = new Date(2025, 0, 15, 12);
  const draft = {
    localValue: selectedDate,
    initialValue: selectedDate,
    localNoTime: false,
    hasChanges: true,
    clearLocalValue: vi.fn(),
  };

  return { draft, selectedDate, useDateTimePickerDraft: vi.fn(() => draft) };
});

vi.mock('$hooks/ui/useDateTimePickerDraft', () => ({
  useDateTimePickerDraft: mocks.useDateTimePickerDraft,
}));

vi.mock('$components/modals/DateTimePickerBody', () => ({
  DateTimePickerBody: () => <output data-testid="picker-body" />,
}));

vi.mock('$components/ModalWrapper', () => ({
  ModalWrapper: ({
    title,
    children,
    footer,
    footerLeft,
  }: {
    title: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    footerLeft?: ReactNode;
  }) => (
    <section>
      <h1>{title}</h1>
      <div data-testid="body">{children}</div>
      <div data-testid="footer-left">{footerLeft}</div>
      <div data-testid="footer">{footer}</div>
    </section>
  ),
}));

describe('DatePickerModal and ReminderPickerModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    mocks.draft.localValue = mocks.selectedDate;
    mocks.draft.initialValue = mocks.selectedDate;
    mocks.draft.localNoTime = false;
    mocks.draft.hasChanges = true;
    mocks.draft.clearLocalValue.mockReset();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('commits a date and its all-day state when done', () => {
    const onChange = vi.fn();
    const onAllDayChange = vi.fn();
    const onClose = vi.fn();

    act(() => {
      root.render(
        createElement(DatePickerModal, {
          isOpen: true,
          onClose,
          onChange,
          onAllDayChange,
          title: 'Start date',
        }),
      );
    });

    const done = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Done',
    );
    act(() => done?.click());

    expect(onChange).toHaveBeenCalledWith(mocks.selectedDate, false);
    expect(onAllDayChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clears a date and resets all-day state', () => {
    const onChange = vi.fn();
    const onAllDayChange = vi.fn();

    act(() => {
      root.render(
        createElement(DatePickerModal, {
          isOpen: true,
          onClose: vi.fn(),
          onChange,
          onAllDayChange,
          title: 'Due date',
        }),
      );
    });

    const clear = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Clear',
    );
    act(() => clear?.click());

    expect(onChange).toHaveBeenCalledWith(undefined, false);
    expect(onAllDayChange).toHaveBeenCalledWith(false);
    expect(mocks.draft.clearLocalValue).toHaveBeenCalledOnce();
  });

  it('saves an edited reminder and closes the modal', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    act(() => {
      root.render(
        createElement(ReminderPickerModal, {
          isOpen: true,
          onClose,
          onSave,
          title: 'Edit reminder',
          value: mocks.selectedDate,
        }),
      );
    });

    const save = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Save',
    );
    act(() => save?.click());

    expect(onSave).toHaveBeenCalledWith(mocks.selectedDate);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clears an existing reminder without saving a replacement', () => {
    const onClear = vi.fn();
    const onSave = vi.fn();

    act(() => {
      root.render(
        createElement(ReminderPickerModal, {
          isOpen: true,
          onClose: vi.fn(),
          onSave,
          onClear,
          value: mocks.selectedDate,
        }),
      );
    });

    const clear = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Clear',
    );
    act(() => clear?.click());

    expect(onClear).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
    expect(mocks.draft.clearLocalValue).toHaveBeenCalledOnce();
  });
});
