import { createContext, useContext } from 'react';
import type {
  NotificationAlertStyle,
  NotificationPermissionResult,
  NotificationPermissionStatus,
} from '$types/notifications/permission';

interface NotificationContextValue {
  /** macOS system permission status. always null on Windows/Linux */
  permissionStatus: NotificationPermissionStatus | null;
  /** macOS alert presentation style. always null on Windows/Linux */
  notificationAlertStyle: NotificationAlertStyle | null;
  isCheckingPermission: boolean;
  /** re-check the current system permission and sync app state */
  checkPermission: () => Promise<void>;
  /** trigger the macOS permission request dialog */
  requestPermission: () => Promise<NotificationPermissionResult>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
