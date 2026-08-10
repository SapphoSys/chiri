import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImportModal } from '$components/modals/ImportModal/ImportModal';
import type { Account } from '$types/account';
import { makeCalendar } from '../fixtures';

const calendar = makeCalendar({ id: 'calendar-1', accountId: 'account-1' });
const account: Account = {
  id: 'account-1',
  name: 'Personal',
  calendars: [calendar],
  isActive: true,
  sortOrder: 0,
  caldav: null,
};

const mocks = vi.hoisted(() => ({
  handleImport: vi.fn(),
  resetImport: vi.fn(),
}));

vi.mock('$hooks/queries/useAccounts', () => ({
  useAccounts: () => ({ data: [account] }),
}));

vi.mock('$hooks/import/useImportExecution', () => ({
  useImportExecution: () => ({
    isImporting: false,
    importProgress: 0,
    importSuccess: false,
    handleImport: mocks.handleImport,
    resetImport: mocks.resetImport,
  }),
}));

vi.mock('$components/ModalWrapper', () => ({
  ModalWrapper: ({
    title,
    children,
    footer,
  }: {
    title: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
  }) => (
    <section>
      <h1>{title}</h1>
      <div data-testid="body">{children}</div>
      <div data-testid="footer">{footer}</div>
    </section>
  ),
}));

vi.mock('$components/modals/ImportModal/ImportModalBody', () => ({
  ImportModalBody: ({
    step,
    parsedTasks,
    onDestinationSelect,
  }: {
    step: string;
    parsedTasks: Array<unknown>;
    onDestinationSelect: (accountId: string, calendarId: string) => void;
  }) => (
    <div data-testid="import-step" data-step={step} data-task-count={parsedTasks.length}>
      {step === 'destination' && (
        <button type="button" onClick={() => onDestinationSelect('account-1', 'calendar-1')}>
          Choose calendar
        </button>
      )}
    </div>
  ),
}));

vi.mock('$components/modals/ImportModal/ImportModalFooter', () => ({
  ImportModalFooter: ({
    placement,
    step,
    canProceed,
    onNext,
    onImport,
  }: {
    placement: 'left' | 'main';
    step: string;
    canProceed: boolean;
    onNext: () => void;
    onImport: () => void;
  }) =>
    placement === 'main' ? (
      <div>
        {step !== 'review' ? (
          <button type="button" disabled={!canProceed} onClick={onNext}>
            Continue
          </button>
        ) : (
          <button type="button" onClick={onImport}>
            Import
          </button>
        )}
      </div>
    ) : null,
}));

describe('ImportModal workflow', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    mocks.handleImport.mockReset();
    mocks.resetImport.mockReset();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('walks a preloaded ICS file through destination selection and review', async () => {
    await act(async () => {
      root.render(
        <ImportModal
          isOpen
          onClose={vi.fn()}
          preloadedFile={{
            name: 'tasks.ics',
            content:
              'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VTODO\nUID:imported-task\nSUMMARY:Buy milk\nEND:VTODO\nEND:VCALENDAR',
          }}
        />,
      );
    });

    expect(container.querySelector('[data-testid="import-step"]')?.getAttribute('data-step')).toBe(
      'upload',
    );
    expect(
      container.querySelector('[data-testid="import-step"]')?.getAttribute('data-task-count'),
    ).toBe('1');

    const continueButton = () =>
      Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent === 'Continue',
      ) as HTMLButtonElement;

    await act(async () => continueButton().click());
    expect(container.querySelector('[data-testid="import-step"]')?.getAttribute('data-step')).toBe(
      'destination',
    );
    expect(continueButton().disabled).toBe(true);

    await act(async () => {
      container.querySelector('button')?.click();
    });
    expect(continueButton().disabled).toBe(false);

    await act(async () => continueButton().click());
    expect(container.querySelector('[data-testid="import-step"]')?.getAttribute('data-step')).toBe(
      'review',
    );

    await act(async () => {
      Array.from(container.querySelectorAll('button'))
        .find((button) => button.textContent === 'Import')
        ?.click();
    });
    expect(mocks.handleImport).toHaveBeenCalledOnce();
  });
});
