import { useQueryClient } from '@tanstack/react-query';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import {
  BrowserAuthFlow,
  type BrowserAuthFlowHandle,
  type BrowserAuthFlowPhase,
} from '$components/modals/AccountModal/BrowserAuthFlow';
import { useSettingsStore } from '$context/settingsContext';
import { useAddCalendar, useCreateAccount } from '$hooks/queries/useAccounts';
import { useSyncQuery } from '$hooks/queries/useSync';
import {
  FASTMAIL_CALDAV_URL,
  startFastmailOAuth,
  usernameFromPrincipalUrl,
} from '$lib/auth/fastmail';
import { CalDAVClient } from '$lib/caldav';
import { loggers } from '$lib/logger';
import { ensureTagExists } from '$lib/store/sync';
import { createTask } from '$lib/store/tasks';

const log = loggers.account;

export interface FastmailOAuthStepHandle {
  connect: () => void;
  cancel: () => void;
  getPhase: () => BrowserAuthFlowPhase;
}

interface FastmailOAuthStepProps {
  onSuccess: () => void;
  onSetupInProgressChange: (inProgress: boolean) => void;
  onConnectStateChange?: (state: { disabled: boolean; loading: boolean }) => void;
}

export const FastmailOAuthStep = forwardRef<FastmailOAuthStepHandle, FastmailOAuthStepProps>(
  ({ onSuccess, onSetupInProgressChange, onConnectStateChange }, ref) => {
    const flowRef = useRef<BrowserAuthFlowHandle>(null);
    const queryClient = useQueryClient();
    const createAccountMutation = useCreateAccount();
    const addCalendarMutation = useAddCalendar();
    const { syncAll } = useSyncQuery();
    const { enforceVapid } = useSettingsStore();

    useEffect(() => {
      return () => {
        flowRef.current?.cancel();
      };
    }, []);

    const startFlow = async ({
      signal,
      setPhase,
    }: {
      serverUrl: string;
      signal: AbortSignal;
      setPhase: (phase: 'browser' | 'connecting') => void;
    }) => {
      const flow = startFastmailOAuth();

      const onAbort = () => {
        flow.cancel();
      };
      signal.addEventListener('abort', onAbort);

      try {
        setPhase('browser');
        const tokens = await flow.promise;

        if (signal.aborted) {
          throw new DOMException('Fastmail OAuth flow was cancelled', 'AbortError');
        }

        setPhase('connecting');

        const accountId = crypto.randomUUID();
        const { accessToken, refreshToken, tokenExpiry } = tokens;

        const { principalUrl, displayName } = await CalDAVClient.connectWithBearer(
          accountId,
          FASTMAIL_CALDAV_URL,
          '',
          accessToken,
          'fastmail',
        );

        const username = usernameFromPrincipalUrl(principalUrl);

        const calendars = await CalDAVClient.getForAccount(accountId).fetchCalendars(enforceVapid);

        const newAccount = await createAccountMutation.mutateAsync({
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
        });

        for (const calendar of calendars) {
          addCalendarMutation.mutate({ accountId: newAccount.id, calendarData: calendar });
        }

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
            log.error(`[FastmailOAuth] Failed to fetch tasks for ${calendar.displayName}:`, e);
          }
        }

        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['tags'] });

        syncAll({
          source: 'account-setup-fastmail',
          reason: 'completed Fastmail OAuth account creation',
          where: 'FastmailOAuthStep',
        });
      } catch (e) {
        if (
          signal.aborted ||
          (e instanceof Error && e.message.toLowerCase().includes('cancelled'))
        ) {
          throw new DOMException('Fastmail OAuth flow was cancelled', 'AbortError');
        }
        throw e;
      } finally {
        signal.removeEventListener('abort', onAbort);
      }
    };

    useImperativeHandle(ref, () => ({
      connect: () => flowRef.current?.connect(),
      cancel: () => flowRef.current?.cancel(),
      getPhase: () => flowRef.current?.getPhase() ?? 'idle',
    }));

    return (
      <BrowserAuthFlow
        ref={flowRef}
        providerName="Fastmail"
        serverType="fastmail"
        startFlow={startFlow}
        onSuccess={onSuccess}
        onPhaseChange={(phase) => {
          onSetupInProgressChange(phase === 'connecting');
        }}
        onConnectStateChange={onConnectStateChange}
      />
    );
  },
);

FastmailOAuthStep.displayName = 'FastmailOAuthStep';
