import { useQueryClient } from '@tanstack/react-query';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ConnectionNoticeBanner } from '$components/ConnectionNoticeBanner';
import { BrowserAuthStep } from '$components/modals/AccountModal/BrowserAuthStep';
import { ServerTypeDescriptionBanner } from '$components/ServerTypeDescriptionBanner';
import { useSettingsStore } from '$context/settingsContext';
import { useAddCalendar, useCreateAccount } from '$hooks/queries/useAccounts';
import { useSyncQuery } from '$hooks/queries/useSync';
import {
  FASTMAIL_CALDAV_URL,
  type FastmailTokens,
  startFastmailOAuth,
  usernameFromPrincipalUrl,
} from '$lib/auth/fastmail';
import { CalDAVClient } from '$lib/caldav';
import { type CalDAVSetupError, toCalDAVSetupError } from '$lib/caldav/setup';
import { loggers } from '$lib/logger';
import { ensureTagExists } from '$lib/store/sync';
import { createTask } from '$lib/store/tasks';

const log = loggers.account;

export interface FastmailOAuthStepHandle {
  connect: () => void;
  cancel: () => void;
  getPhase: () => Phase;
}

interface FastmailOAuthStepProps {
  onSuccess: () => void;
  onSetupInProgressChange: (inProgress: boolean) => void;
  onConnectStateChange?: (state: { disabled: boolean; loading: boolean }) => void;
}

type Phase = 'idle' | 'browser' | 'connecting' | 'done';

export const FastmailOAuthStep = forwardRef<FastmailOAuthStepHandle, FastmailOAuthStepProps>(
  ({ onSuccess, onSetupInProgressChange, onConnectStateChange }, ref) => {
    const [phase, setPhase] = useState<Phase>('idle');
    const [error, setError] = useState<CalDAVSetupError | null>(null);
    const queryClient = useQueryClient();
    const createAccountMutation = useCreateAccount();
    const addCalendarMutation = useAddCalendar();
    const { syncAll } = useSyncQuery();
    const { enforceVapid } = useSettingsStore();
    const activeFlowRef = useRef<{ cancel: () => void } | null>(null);
    const cancelledRef = useRef(false);

    const handleConnect = async () => {
      setError(null);
      setPhase('browser');
      cancelledRef.current = false;

      let tokens: FastmailTokens;
      try {
        const flow = startFastmailOAuth();
        activeFlowRef.current = flow;
        tokens = await flow.promise;
      } catch (e) {
        if (cancelledRef.current) {
          log.info('[FastmailOAuth] OAuth flow cancelled by user');
          setPhase('idle');
          cancelledRef.current = false;
          return;
        }

        log.error('[FastmailOAuth] OAuth flow failed:', e);
        setError(
          toCalDAVSetupError(
            'Fastmail OAuth failed',
            e,
            'Verify that you approved access in your browser and that Fastmail is reachable.',
          ),
        );
        setPhase('idle');
        return;
      } finally {
        activeFlowRef.current = null;
      }

      setPhase('connecting');

      try {
        const accountId = crypto.randomUUID();
        const { accessToken, refreshToken, tokenExpiry } = tokens;

        // connect to CalDAV: principal URL contains the username (email)
        const { principalUrl, displayName } = await CalDAVClient.connectWithBearer(
          accountId,
          FASTMAIL_CALDAV_URL,
          '',
          accessToken,
          'fastmail',
        );

        const username = usernameFromPrincipalUrl(principalUrl);

        log.info('[FastmailOAuth] Fetching calendars');
        const calendars = await CalDAVClient.getForAccount(accountId).fetchCalendars(enforceVapid);
        log.info(`[FastmailOAuth] Found ${calendars.length} calendars`);

        createAccountMutation.mutate(
          {
            id: accountId,
            name: `${displayName || username} (Fastmail)`,
            icon: 'user',
            caldav: {
              serverUrl: FASTMAIL_CALDAV_URL,
              username,
              password: accessToken,
              serverType: 'fastmail',
              authType: 'oauth',
              refreshToken,
              tokenExpiry,
            },
          },
          {
            onSuccess: async (newAccount) => {
              try {
                for (const calendar of calendars) {
                  addCalendarMutation.mutate({ accountId: newAccount.id, calendarData: calendar });
                }

                log.debug('[FastmailOAuth] Fetching initial tasks');
                for (const calendar of calendars) {
                  try {
                    const remoteTasks = await CalDAVClient.getForAccount(newAccount.id).fetchTasks(
                      calendar,
                    );
                    if (!remoteTasks) continue;
                    for (const remoteTask of remoteTasks) {
                      let tagIds: string[] = [];
                      if (remoteTask.categoryId) {
                        const names = remoteTask.categoryId
                          .split(',')
                          .map((s: string) => s.trim())
                          .filter(Boolean);
                        tagIds = names.map((name: string) => ensureTagExists(name));
                      }
                      createTask({ ...remoteTask, tags: tagIds });
                    }
                  } catch (e) {
                    log.error(
                      `[FastmailOAuth] Failed to fetch tasks for ${calendar.displayName}:`,
                      e,
                    );
                  }
                }

                queryClient.invalidateQueries({ queryKey: ['tasks'] });
                queryClient.invalidateQueries({ queryKey: ['tags'] });

                setPhase('done');

                // kick off a background sync
                syncAll({
                  source: 'account-setup-fastmail',
                  reason: 'completed Fastmail OAuth account creation',
                  where: 'FastmailOAuthStep',
                });

                onSuccess();
              } catch (e) {
                log.error('[FastmailOAuth] Post-create setup failed:', e);
                onSuccess(); // still close, account was created
              }
            },
            onError: (e) => {
              setError(
                toCalDAVSetupError(
                  'Failed to create account',
                  e,
                  'The account could not be saved. Try again or check the logs for details.',
                ),
              );
              setPhase('idle');
            },
          },
        );
      } catch (e) {
        log.error('[FastmailOAuth] Failed to connect to Fastmail:', e);
        setError(
          toCalDAVSetupError(
            'Could not connect to Fastmail',
            e,
            'Verify that Fastmail is reachable and that you authorized the correct account.',
          ),
        );
        setPhase('idle');
      }
    };

    useImperativeHandle(ref, () => ({
      connect: handleConnect,
      cancel: () => {
        cancelledRef.current = true;
        activeFlowRef.current?.cancel();
        activeFlowRef.current = null;
        setPhase('idle');
      },
      getPhase: () => phase,
    }));

    const isLoading = phase === 'browser' || phase === 'connecting';
    const isSetupInProgress = phase === 'connecting';

    useEffect(() => {
      onSetupInProgressChange(isSetupInProgress);
    }, [isSetupInProgress, onSetupInProgressChange]);

    useEffect(() => {
      onConnectStateChange?.({ disabled: isLoading, loading: isLoading });
    }, [isLoading, onConnectStateChange]);

    return (
      <div className="space-y-4 p-4">
        {phase === 'idle' && <ServerTypeDescriptionBanner serverType="fastmail" />}

        <BrowserAuthStep providerName="Fastmail" phase={phase} />

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
  },
);
FastmailOAuthStep.displayName = 'FastmailOAuthStep';
