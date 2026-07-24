import { getCurrentWindow } from '@tauri-apps/api/window';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ConnectionNoticeBanner } from '$components/ConnectionNoticeBanner';
import { BrowserAuthStep } from '$components/modals/AccountModal/BrowserAuthStep';
import { ServerTypeDescriptionBanner } from '$components/ServerTypeDescriptionBanner';
import { useSettingsStore } from '$context/settingsContext';
import { useAddCalendar, useCreateAccount } from '$hooks/queries/useAccounts';
import { useSyncQuery } from '$hooks/queries/useSync';
import { cancelNextcloudLogin, initiateNextcloudLogin } from '$lib/auth/nextcloud';
import { CalDAVClient } from '$lib/caldav';
import { type CalDAVSetupError, toCalDAVSetupError } from '$lib/caldav/setup';
import { loggers } from '$lib/logger';
import { generateUUID } from '$utils/misc';

const log = loggers.account;

const DISROOT_CLOUD_URL = 'https://cloud.disroot.org';

export interface DisrootCloudBrowserLoginStepHandle {
  cancel: () => void;
  connect: () => void;
  getPhase: () => Phase;
}

interface DisrootCloudBrowserLoginStepProps {
  onSuccess: () => void;
  onSetupInProgressChange: (inProgress: boolean) => void;
  onConnectStateChange?: (state: { disabled: boolean; loading: boolean }) => void;
}

type Phase = 'idle' | 'browser' | 'connecting' | 'done';

export const DisrootCloudBrowserLoginStep = forwardRef<
  DisrootCloudBrowserLoginStepHandle,
  DisrootCloudBrowserLoginStepProps
>(({ onSuccess, onSetupInProgressChange, onConnectStateChange }, ref) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<CalDAVSetupError | null>(null);
  const createAccountMutation = useCreateAccount();
  const addCalendarMutation = useAddCalendar();
  const { syncAll } = useSyncQuery();
  const { enforceVapid } = useSettingsStore();
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelNextcloudLogin();
    };
  }, []);

  const handleConnect = async () => {
    setError(null);
    setPhase('browser');
    cancelledRef.current = false;

    try {
      log.info('[DisrootCloudBrowserLogin] Starting Nextcloud login flow', {
        serverUrl: DISROOT_CLOUD_URL,
      });
      const credentials = await initiateNextcloudLogin(DISROOT_CLOUD_URL);

      log.info('[DisrootCloudBrowserLogin] Login credentials received', {
        loginName: credentials.loginName,
      });

      try {
        await getCurrentWindow().setFocus();
      } catch (err) {
        log.warn('[DisrootCloudBrowserLogin] Failed to focus window after authentication', {
          error: err,
        });
      }

      setPhase('connecting');

      const accountId = generateUUID();
      const { displayName } = await CalDAVClient.connect(
        accountId,
        credentials.server,
        credentials.loginName,
        credentials.appPassword,
        'disrootCloud',
      );

      log.info('[DisrootCloudBrowserLogin] Fetching calendars');
      const calendars = await CalDAVClient.getForAccount(accountId).fetchCalendars(enforceVapid);
      log.info(`[DisrootCloudBrowserLogin] Found ${calendars.length} calendars`);

      await createAccountMutation.mutateAsync({
        id: accountId,
        name: `${displayName || credentials.loginName} (Disroot Cloud)`,
        icon: 'user',
        caldav: {
          serverUrl: credentials.server,
          username: credentials.loginName,
          password: credentials.appPassword,
          serverType: 'disrootCloud',
          authType: 'basic',
        },
      });

      if (calendars.length > 0) {
        for (const calendar of calendars) {
          await addCalendarMutation.mutateAsync({ accountId, calendarData: calendar });
        }
      }

      setPhase('done');

      await syncAll({
        source: 'account-setup-disrootCloud',
        reason: 'completed Disroot Cloud browser login account creation',
        where: 'DisrootCloudBrowserLoginStep',
      });

      onSuccess();
    } catch (e) {
      if (cancelledRef.current) {
        log.info('[DisrootCloudBrowserLogin] Login cancelled by user');
        setPhase('idle');
        cancelledRef.current = false;
        return;
      }

      log.error('[DisrootCloudBrowserLogin] Login failed', { error: e });
      setError(
        toCalDAVSetupError(
          'Could not connect to Disroot Cloud',
          e,
          'Verify that Disroot Cloud is reachable and that you approved access in your browser.',
        ),
      );
      setPhase('idle');
    }
  };

  const isLoading = phase === 'browser' || phase === 'connecting';
  const isSetupInProgress = phase === 'connecting';

  useEffect(() => {
    onSetupInProgressChange(isSetupInProgress);
  }, [isSetupInProgress, onSetupInProgressChange]);

  useEffect(() => {
    onConnectStateChange?.({ disabled: isLoading, loading: isLoading });
  }, [isLoading, onConnectStateChange]);

  useImperativeHandle(ref, () => ({
    cancel: () => {
      cancelledRef.current = true;
      cancelNextcloudLogin();
      setPhase('idle');
      setError(null);
    },
    connect: handleConnect,
    getPhase: () => phase,
  }));

  return (
    <div className="space-y-4 p-4">
      {phase === 'idle' && <ServerTypeDescriptionBanner serverType="disrootCloud" />}

      <BrowserAuthStep providerName="Disroot Cloud" phase={phase} />

      {error && (
        <ConnectionNoticeBanner
          success={false}
          error={error}
          notice={null}
          calendarCount={0}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
});
DisrootCloudBrowserLoginStep.displayName = 'DisrootCloudBrowserLoginStep';
