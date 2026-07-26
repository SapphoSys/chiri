// note: 'ephemeral' is iOS-only and not available on macOS
export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'provisional';

export interface NotificationPermissionStatusResult {
  status: NotificationPermissionStatus;
}

export interface NotificationPermissionResult {
  granted: boolean;
  status: NotificationPermissionStatus;
}
