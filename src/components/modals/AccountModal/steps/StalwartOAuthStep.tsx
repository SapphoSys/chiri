import { getCurrentWindow } from '@tauri-apps/api/window';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  BrowserAuthFlowStep,
  type BrowserAuthFlowStepHandle,
  type BrowserAuthFlowStepPhase,
} from '$components/modals/AccountModal/steps/BrowserAuthFlowStep';
import { useSettingsStore } from '$context/settingsContext';
import { useAddCalendar, useCreateAccount } from '$hooks/queries/useAccounts';
import { useSyncQuery } from '$hooks/queries/useSync';
import {
  type StalwartTokens,
  startStalwartOAuth,
  usernameFromPrincipalUrl,
  validateStalwartServer,
} from '$lib/auth/stalwart';
import { CalDAVClient } from '$lib/caldav';
import { toCalDAVSetupError } from '$lib/caldav/setup';
import { loggers } from '$lib/logger';
import { ensureTagExists } from '$lib/store/sync';
import { createTask } from '$lib/store/tasks';

const log = loggers.account;

export type StalwartOAuthLoginStep = 'input' | 'authenticating' | 'processing';

export interface StalwartOAuthStepHandle {
  connect: () => void;
  cancel: () => void;
  getPhase: () => BrowserAuthFlowStepPhase;
}

interface StalwartOAuthStepProps {
  serverUrl: string;
  onServerUrlChange: (url: string) => void;
  acceptInvalidCerts: boolean;
  onSuccess: () => void;
  onStepChange: (step: StalwartOAuthLoginStep) => void;
  onConnectStateChange?: (state: { disabled: boolean; loading: boolean }) => void;
}

export const StalwartOAuthStep = forwardRef<StalwartOAuthStepHandle, StalwartOAuthStepProps>(
  (
    {
      serverUrl,
      onServerUrlChange,
      acceptInvalidCerts,
      onSuccess,
      onStepChange,
      onConnectStateChange,
    },
    ref,
  ) => {
    const flowRef = useRef<BrowserAuthFlowStepHandle>(null);
    const createAccountMutation = useCreateAccount();
    const addCalendarMutation = useAddCalendar();
    const { syncAll } = useSyncQuery();
    const { enforceVapid } = useSettingsStore();

    const finishSetup = async (url: string, tokens: StalwartTokens) => {
      const { principalUrl, displayName } = await CalDAVClient.connectWithBearer(
        'stalwart-oauth-setup',
        url,
        tokens.username,
        tokens.accessToken,
        'stalwart',
        undefined,
        undefined,
        acceptInvalidCerts,
      );

      const username =
        tokens.username || usernameFromPrincipalUrl(principalUrl) || 'Stalwart account';

      const calendars =
        await CalDAVClient.getForAccount('stalwart-oauth-setup').fetchCalendars(enforceVapid);

      log.info(`[StalwartOAuth] Found ${calendars?.length ?? 0} calendars`, {
        serverUrl: url,
        displayName,
      });

      const newAccount = await createAccountMutation.mutateAsync({
        name: displayName || username,
        caldav: {
          serverUrl: url,
          username,
          password: tokens.accessToken,
          serverType: 'stalwart',
          authType: 'oauth',
          refreshToken: tokens.refreshToken,
          tokenExpiry: tokens.tokenExpiry,
          oauthClientId: tokens.clientId,
          acceptInvalidCerts,
        },
      });

      for (const calendar of calendars ?? []) {
        addCalendarMutation.mutate({ accountId: newAccount.id, calendarData: calendar });
      }

      for (const calendar of calendars ?? []) {
        try {
          const remoteTasks = await CalDAVClient.getForAccount(newAccount.id).fetchTasks(calendar);
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
            createTask({ ...remoteTask, tags: tagIds }, { source: 'remote' });
          }
        } catch (e) {
          log.error(`[StalwartOAuth] Failed to fetch tasks for ${calendar.displayName}:`, e);
        }
      }

      syncAll({
        source: 'account-setup-stalwart',
        reason: 'completed Stalwart OAuth account creation',
        where: 'StalwartOAuthStep',
      });
    };

    const validateServerUrl = async (rawUrl: string, signal: AbortSignal) => {
      const result = await validateStalwartServer(rawUrl, signal, acceptInvalidCerts);
      if (signal.aborted) {
        return;
      }

      if (!result.ok) {
        if (result.reason === 'timeout') {
          throw toCalDAVSetupError(
            'Could not connect to Stalwart',
            'The connection to Stalwart timed out.',
          );
        }

        throw toCalDAVSetupError(
          'Could not connect to Stalwart',
          'Chiri could not reach the Stalwart server.',
        );
      }
    };

    const startFlow = async ({
      serverUrl: url,
      signal,
      setPhase,
    }: {
      serverUrl: string;
      signal: AbortSignal;
      setPhase: (phase: 'browser' | 'connecting') => void;
    }) => {
      const flow = startStalwartOAuth(url, { acceptInvalidCerts });

      const onAbort = () => {
        flow.cancel();
      };
      signal.addEventListener('abort', onAbort);

      try {
        setPhase('browser');
        const tokens = await flow.promise;

        if (signal.aborted) {
          throw new DOMException('Stalwart OAuth flow was cancelled', 'AbortError');
        }

        try {
          await getCurrentWindow().setFocus();
        } catch (err) {
          log.warn('[StalwartOAuth] Failed to focus window after authentication', { error: err });
        }

        setPhase('connecting');
        await finishSetup(url, tokens);
      } catch (e) {
        if (
          signal.aborted ||
          (e instanceof Error && e.message.toLowerCase().includes('cancelled'))
        ) {
          throw new DOMException('Stalwart OAuth flow was cancelled', 'AbortError');
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
      <BrowserAuthFlowStep
        ref={flowRef}
        providerName="Stalwart"
        serverType="stalwart"
        requiresServerUrl
        urlLabel="Stalwart Server URL"
        urlPlaceholder="https://mail.example.com"
        urlValue={serverUrl}
        onUrlChange={onServerUrlChange}
        validateServerUrl={validateServerUrl}
        startFlow={startFlow}
        onSuccess={onSuccess}
        onPhaseChange={(phase) => {
          onStepChange(
            phase === 'idle'
              ? 'input'
              : phase === 'connecting' || phase === 'done'
                ? 'processing'
                : 'authenticating',
          );
        }}
        onConnectStateChange={onConnectStateChange}
      />
    );
  },
);
