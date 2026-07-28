import { CalDAVClient } from '$lib/caldav';
import { getSetupNotice, probeSetupVtodoCreationIfNeeded } from '$lib/caldav/setup';
import { type HttpRequestContext, isCertError, tauriRequest } from '$lib/http';
import { loggers } from '$lib/logger';
import type { Account, AccountDraft } from '$types/account';

const log = loggers.account;

export class ConnectionTestCancelledError extends Error {
  constructor() {
    super('Connection test cancelled');
    this.name = 'ConnectionTestCancelledError';
  }
}

export type AccountConnectionInfo = Awaited<ReturnType<typeof CalDAVClient.connect>>;

export type ConnectWithCertHandling = (
  accountId: string,
  effectivePassword: string,
  trimmedServerUrl: string,
  context?: HttpRequestContext,
) => Promise<AccountConnectionInfo | null>;

interface ConnectWithCertHandlingOptions {
  account: Account | null;
  draft: AccountDraft;
  updateDraft: (updates: Partial<AccountDraft>) => void;
  confirmCertificateTrust: () => Promise<boolean>;
}

export const connectWithCertHandling = async (
  { account, draft, updateDraft, confirmCertificateTrust }: ConnectWithCertHandlingOptions,
  accountId: string,
  effectivePassword: string,
  trimmedServerUrl: string,
  context?: HttpRequestContext,
): Promise<AccountConnectionInfo | null> => {
  const isOAuth = account?.caldav?.authType === 'oauth';
  const tryConnect = (withInvalidCerts?: boolean) =>
    CalDAVClient.connect(
      accountId,
      trimmedServerUrl,
      draft.username,
      isOAuth ? '' : effectivePassword,
      draft.serverType,
      draft.calendarHomeUrl.trim() || undefined,
      draft.principalUrl.trim() || undefined,
      withInvalidCerts,
      isOAuth ? effectivePassword : undefined,
      context,
    );

  try {
    return await tryConnect(draft.acceptInvalidCerts || undefined);
  } catch (error) {
    const looksLikeNetworkError =
      isCertError(error) ||
      (typeof error === 'string' && error.includes('error sending request for url'));

    if (context?.signal?.aborted) throw new ConnectionTestCancelledError();
    if (!looksLikeNetworkError) throw error;

    try {
      await tauriRequest(
        trimmedServerUrl,
        'OPTIONS',
        {
          username: draft.username,
          password: effectivePassword,
          acceptInvalidCerts: true,
        },
        undefined,
        undefined,
        context,
      );
    } catch {
      if (context?.signal?.aborted) throw new ConnectionTestCancelledError();
      throw error;
    }

    const proceed = await confirmCertificateTrust();
    if (!proceed) return null;

    updateDraft({ acceptInvalidCerts: true });
    return await tryConnect(true);
  }
};

interface RunConnectionTestOptions {
  account: Account | null;
  draft: AccountDraft;
  enforceVapid: boolean;
  probeConnectionId: string;
  context: HttpRequestContext;
  connect: ConnectWithCertHandling;
  validateServerUrlScheme: () => boolean;
  validatePrincipalUrl: (baseUrl: string) => boolean;
  confirmServerWarning: (calendarHome?: string) => Promise<boolean>;
  confirmServerUrlWarning: (url: string) => Promise<boolean>;
  assertActive: () => void;
}

export const runConnectionTest = async ({
  account,
  draft,
  enforceVapid,
  probeConnectionId,
  context,
  connect,
  validateServerUrlScheme,
  validatePrincipalUrl,
  confirmServerWarning,
  confirmServerUrlWarning,
  assertActive,
}: RunConnectionTestOptions) => {
  const effectivePassword = draft.password || account?.caldav?.password;

  if (!effectivePassword) {
    throw new Error(
      account?.caldav?.authType === 'oauth'
        ? 'Access token missing, try reconnecting via OAuth'
        : 'Password is required to test connection',
    );
  }

  if (!draft.serverUrl.trim() || !draft.username.trim()) {
    throw new Error('Server URL and username are required');
  }

  if (!validateServerUrlScheme()) return null;

  const trimmedServerUrl = draft.serverUrl.trim();
  if (!validatePrincipalUrl(trimmedServerUrl)) return null;

  const proceedWithUrl = await confirmServerUrlWarning(trimmedServerUrl);
  assertActive();
  if (!proceedWithUrl) return null;

  log.debug(`Testing connection to ${trimmedServerUrl}...`);
  const connectionInfo = await connect(
    probeConnectionId,
    effectivePassword,
    trimmedServerUrl,
    context,
  );
  assertActive();
  if (!connectionInfo) return null;

  const proceed = await confirmServerWarning(connectionInfo.calendarHome);
  assertActive();
  if (!proceed) return null;

  log.debug('Fetching calendars...');
  const client = CalDAVClient.getForAccount(probeConnectionId);
  const { calendars, diagnostics } = await client.discoverCalendars(enforceVapid, context);
  assertActive();
  const canCreateVtodoCalendar = await probeSetupVtodoCreationIfNeeded(
    client,
    diagnostics,
    enforceVapid,
    context,
  );
  assertActive();
  log.info(`Connection test successful - found ${calendars.length} calendars`);

  return {
    calendars,
    notice: getSetupNotice(diagnostics, canCreateVtodoCalendar),
  };
};
