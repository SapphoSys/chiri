import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskDefaultsSettings } from '$components/settings/TaskDefaultsSettings/TaskDefaultsSettings';

const mockSetDefaultCalendarId = vi.fn();
const mockSetDefaultStatus = vi.fn();
const mockSetDefaultPercentComplete = vi.fn();
const mockUseAccounts = vi.fn();

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const baseMockStore = {
  defaultPriority: 'none',
  setDefaultPriority: vi.fn(),
  defaultStatus: 'needs-action',
  setDefaultStatus: mockSetDefaultStatus,
  defaultPercentComplete: 0,
  setDefaultPercentComplete: mockSetDefaultPercentComplete,
  syncStatusProgress: true,
  defaultTags: [],
  setDefaultTags: vi.fn(),
  defaultCalendarId: null,
  setDefaultCalendarId: mockSetDefaultCalendarId,
  preferCalDAVCalendarForNewTasks: true,
  setPreferCalDAVCalendarForNewTasks: vi.fn(),
  defaultCalendarColor: 'accent',
  setDefaultCalendarColor: vi.fn(),
  defaultStartDate: 'none',
  setDefaultStartDate: vi.fn(),
  defaultStartTime: null as number | null,
  setDefaultStartTime: vi.fn(),
  defaultDueDate: 'none',
  setDefaultDueDate: vi.fn(),
  defaultDueTime: null as number | null,
  setDefaultDueTime: vi.fn(),
  defaultReminders: [],
  setDefaultReminders: vi.fn(),
  defaultRrule: null,
  setDefaultRrule: vi.fn(),
  defaultRepeatFrom: 0,
  setDefaultRepeatFrom: vi.fn(),
  dateFormat: 'MMM d, yyyy',
  timeFormat: '12',
  defaultTagColor: 'accent',
  setDefaultTagColor: vi.fn(),
};

let mockStore = { ...baseMockStore };

vi.mock('$hooks/queries/useAccounts', () => ({
  useAccounts: () => mockUseAccounts(),
}));

vi.mock('$hooks/queries/useTags', () => ({
  useTags: () => ({ data: [] }),
}));

vi.mock('$hooks/ui/useColorPresets', () => ({
  useColorPresets: () => [],
}));

vi.mock('$hooks/ui/useResolvedAccentColor', () => ({
  useResolvedAccentColor: () => '#7dd3fc',
}));

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => mockStore,
}));

describe('TaskDefaultsSettings', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAccounts.mockReturnValue({ data: [] });
    mockStore = { ...baseMockStore };
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  it('shows a progress slider for every default status', async () => {
    mockStore.defaultStatus = 'in-process';
    mockStore.defaultPercentComplete = 25;

    await act(async () => {
      root.render(<TaskDefaultsSettings />);
    });

    const slider = container.querySelector('input[type="range"]');
    expect(slider).not.toBeNull();
    expect(slider?.getAttribute('value')).toBe('25');
    expect(slider?.getAttribute('min')).toBe('0');
    expect(slider?.getAttribute('max')).toBe('100');
  });

  it('keeps the progress slider available for completed defaults', async () => {
    mockStore.defaultStatus = 'completed';
    mockStore.defaultPercentComplete = 100;

    await act(async () => {
      root.render(<TaskDefaultsSettings />);
    });

    const slider = container.querySelector('input[type="range"]');
    expect(slider).not.toBeNull();
    expect(slider?.getAttribute('value')).toBe('100');
  });

  it('allows independent status and progress defaults when synchronization is disabled', async () => {
    mockStore.defaultStatus = 'cancelled';
    mockStore.defaultPercentComplete = 42;
    mockStore.syncStatusProgress = false;

    await act(async () => {
      root.render(<TaskDefaultsSettings />);
    });

    expect(container.querySelector('input[type="range"]')?.getAttribute('value')).toBe('42');
  });

  it('does not render empty account groups in the default calendar select', async () => {
    mockUseAccounts.mockReturnValue({
      data: [
        {
          id: 'local-account',
          name: 'Local',
          calendars: [],
          isActive: true,
          sortOrder: 100,
          caldav: null,
        },
        {
          id: 'remote-account',
          name: 'Chloe',
          calendars: [
            {
              id: 'tasks-calendar',
              accountId: 'remote-account',
              displayName: 'Tasks',
              url: 'https://example.invalid/tasks/',
              sortOrder: 100,
            },
          ],
          isActive: true,
          sortOrder: 200,
          caldav: {
            serverUrl: 'https://example.invalid/',
            username: 'chloe',
            password: 'secret',
            serverType: 'generic',
            authType: 'basic',
          },
        },
      ],
    });

    await act(async () => {
      root.render(<TaskDefaultsSettings />);
    });

    const calendarOption = container.querySelector('option[value="tasks-calendar"]');
    const calendarSelect = calendarOption?.closest('select');
    const groups = Array.from(calendarSelect?.querySelectorAll('optgroup') ?? []).map(
      (group) => group.label,
    );
    expect(groups).toEqual(['Chloe']);
    expect(calendarOption?.textContent).toBe('Tasks');
  });

  it('disables default times until their matching default dates are configured', async () => {
    await act(async () => {
      root.render(<TaskDefaultsSettings />);
    });

    const startTimeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-labelledby="default-start-time-label"]',
    );
    const dueTimeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-labelledby="default-due-time-label"]',
    );

    expect(startTimeButton?.disabled).toBe(true);
    expect(startTimeButton?.textContent).toBe('Set a default start date first');
    expect(dueTimeButton?.disabled).toBe(true);
    expect(dueTimeButton?.textContent).toBe('Set a default due date first');
  });

  it('keeps a saved time visible while its default date is disabled', async () => {
    mockStore.defaultStartTime = 9 * 60;

    await act(async () => {
      root.render(<TaskDefaultsSettings />);
    });

    const startTimeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-labelledby="default-start-time-label"]',
    );

    expect(startTimeButton?.disabled).toBe(true);
    expect(startTimeButton?.textContent).toBe('9:00 AM');
  });

  it('keeps start and due time availability independent', async () => {
    mockStore.defaultStartDate = 'today';

    await act(async () => {
      root.render(<TaskDefaultsSettings />);
    });

    const startTimeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-labelledby="default-start-time-label"]',
    );
    const dueTimeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-labelledby="default-due-time-label"]',
    );

    expect(startTimeButton?.disabled).toBe(false);
    expect(startTimeButton?.textContent).toBe('Set default time...');
    expect(dueTimeButton?.disabled).toBe(true);
    expect(dueTimeButton?.textContent).toBe('Set a default due date first');
  });

  it('requires a due date for start dates relative to due', async () => {
    mockStore.defaultStartDate = 'due-date';

    await act(async () => {
      root.render(<TaskDefaultsSettings />);
    });

    const startTimeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-labelledby="default-start-time-label"]',
    );

    expect(startTimeButton?.disabled).toBe(true);
    expect(startTimeButton?.textContent).toBe('Set a default due date first');
  });
});
