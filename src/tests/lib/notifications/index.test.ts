import { describe, expect, it, vi } from 'vitest';
import { checkNotificationAlertStyle, setNotificationActionConfig } from '$lib/notifications';

const invoke = vi.hoisted(() =>
  vi.fn((..._args: unknown[]) => Promise.resolve<unknown>(undefined)),
);

vi.mock('@tauri-apps/api/core', () => ({ invoke }));

describe('setNotificationActionConfig', () => {
  it('disables snooze when no durations are configured', async () => {
    await setNotificationActionConfig({
      complete: true,
      snooze: true,
      snoozeDurations: [],
      order: ['complete', 'snooze'],
    });

    expect(invoke).toHaveBeenCalledWith('set_notification_action_config', {
      config: {
        showComplete: true,
        showSnooze: false,
        snoozeDurations: [],
        actionOrder: ['complete', 'snooze'],
      },
    });
  });
});

describe('checkNotificationAlertStyle', () => {
  it('reads the current native macOS alert style', async () => {
    invoke.mockResolvedValueOnce({ style: 'banner' });

    await expect(checkNotificationAlertStyle()).resolves.toEqual({ style: 'banner' });
    expect(invoke).toHaveBeenLastCalledWith('check_notification_alert_style');
  });
});
