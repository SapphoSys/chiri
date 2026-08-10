import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NotificationContext } from '$context/notificationContext';
import { settingsStore } from '$context/settingsContext';
import { loggers } from '$lib/logger';
import {
  checkNotificationPermission,
  getCachedNotificationPermission,
  requestNotificationPermission,
} from '$lib/notifications';
import type { NotificationPermissionStatus } from '$types/notifications/permission';
import { isMacPlatform } from '$utils/platform';

const log = loggers.notifications;

// long interval: just a safety net. the window focus listener handles the
// common case (user returning from System Settings) near-instantly
const SYNC_INTERVAL_MS = 5 * 60 * 1000;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(
    // seed from the module-level cache so there's no flash of "unknown" state
    () => (isMacPlatform() ? getCachedNotificationPermission() : null),
  );
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const applyPermissionStatus = useCallback((status: NotificationPermissionStatus) => {
    setPermissionStatus(status);

    // if the user revoked or reset permission in System Settings while the
    // app was running, mirror that by disabling the in-app toggle
    if ((status === 'denied' || status === 'default') && settingsStore.getState().notifications) {
      log.info('macOS notification permission is unavailable, disabling in-app notifications');
      settingsStore.setNotifications(false);
    }
  }, []);

  const syncPermission = useCallback(async () => {
    if (!isMacPlatform()) return;
    try {
      const { status } = await checkNotificationPermission();
      applyPermissionStatus(status);
    } catch (error) {
      log.error('Failed to sync macOS notification permission:', error);
    }
  }, [applyPermissionStatus]);

  useEffect(() => {
    if (!isMacPlatform()) return;

    let didCancel = false;
    let unlistenNativeFocus: (() => void) | undefined;

    syncPermission();

    // near-instant sync: fires as soon as the user switches back from
    // system Settings (or any other app)
    window.addEventListener('focus', syncPermission);

    const subscribeToNativeWindowFocus = async () => {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      if (didCancel) return;

      const unlisten = await getCurrentWindow().onFocusChanged(({ payload: focused }) => {
        if (focused) syncPermission();
      });

      if (didCancel) {
        unlisten();
        return;
      }

      unlistenNativeFocus = unlisten;
    };

    subscribeToNativeWindowFocus().catch(() => {});

    // 5-minute fallback in case the window never lost focus
    intervalRef.current = setInterval(syncPermission, SYNC_INTERVAL_MS);

    return () => {
      didCancel = true;
      window.removeEventListener('focus', syncPermission);
      unlistenNativeFocus?.();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [syncPermission]);

  const checkPermission = useCallback(async () => {
    await syncPermission();
  }, [syncPermission]);

  const requestPermission = useCallback(async () => {
    setIsCheckingPermission(true);
    try {
      const result = await requestNotificationPermission();
      applyPermissionStatus(result.status);
      return result;
    } finally {
      setIsCheckingPermission(false);
    }
  }, [applyPermissionStatus]);

  return (
    <NotificationContext.Provider
      value={{ permissionStatus, isCheckingPermission, checkPermission, requestPermission }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
