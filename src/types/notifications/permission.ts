// note: 'ephemeral' is iOS-only and not available on macOS
export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'provisional';

export type NotificationAlertStyle = 'none' | 'banner' | 'alert' | 'unknown';

export interface NotificationPermissionStatusResult {
  status: NotificationPermissionStatus;
}

export interface NotificationPermissionResult {
  granted: boolean;
  status: NotificationPermissionStatus;
}

export interface NotificationAlertStyleResult {
  style: NotificationAlertStyle;
}
