import { describe, expect, it, vi } from 'vitest';
import { setNotificationActionConfig } from '$lib/notifications';

const invoke = vi.hoisted(() => vi.fn(() => Promise.resolve()));

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
