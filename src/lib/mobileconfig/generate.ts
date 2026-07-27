import { parseCalDAVServerUrl } from '$lib/caldav/utils';
import { serializePlist } from '$lib/mobileconfig/plist';
import type { Account } from '$types/account';
import type {
  MobileConfigCredentialWarning,
  MobileConfigExportEligibility,
  MobileConfigGenerationOptions,
} from '$types/mobileconfig/export';

/**
 * generate an Apple Configuration Profile (.mobileconfig) XML for a CalDAV account
 *
 * the generated profile can be opened directly on iPhone, iPad, or macOS
 * to add the CalDAV account without manual configuration
 */
export const generateMobileConfig = (
  account: Account,
  { includePassword = false, profileUuid, payloadUuid }: MobileConfigGenerationOptions = {},
) => {
  const caldav = account.caldav;
  if (!caldav) throw new Error('Account has no CalDAV configuration');

  const parsedServerUrl = parseCalDAVServerUrl(caldav.serverUrl);
  if (!parsedServerUrl.ok) {
    throw new Error('Account has an invalid CalDAV server URL');
  }
  const url = parsedServerUrl.url;

  const normalizedProfileUuid = (profileUuid ?? crypto.randomUUID()).toUpperCase();
  const normalizedPayloadUuid = (payloadUuid ?? crypto.randomUUID()).toUpperCase();
  const serverHostname = url.hostname;
  const serverPort = url.port ? Number.parseInt(url.port, 10) : undefined;
  const useSSL = url.protocol === 'https:';
  const accountDescription = account.name;

  return serializePlist({
    PayloadContent: [
      {
        CalDAVAccountDescription: accountDescription,
        CalDAVHostName: serverHostname,
        CalDAVPort: serverPort,
        CalDAVUseSSL: useSSL,
        CalDAVUsername: caldav.username,
        CalDAVPassword: includePassword && caldav.password ? caldav.password : undefined,
        CalDAVPrincipalURL: caldav.principalUrl || undefined,
        PayloadDescription: 'CalDAV Account',
        PayloadDisplayName: accountDescription,
        PayloadIdentifier: `com.apple.caldav.account.${normalizedPayloadUuid}`,
        PayloadType: 'com.apple.caldav.account',
        PayloadUUID: normalizedPayloadUuid,
        PayloadVersion: 1,
      },
    ],
    PayloadDescription: `CalDAV account configuration for ${accountDescription}`,
    PayloadDisplayName: `${accountDescription} CalDAV`,
    PayloadIdentifier: `com.chiri.caldav.${normalizedProfileUuid}`,
    PayloadRemovalDisallowed: false,
    PayloadType: 'Configuration',
    PayloadUUID: normalizedProfileUuid,
    PayloadVersion: 1,
  });
};

export const getMobileConfigExportEligibility = (
  account: Account,
): MobileConfigExportEligibility => {
  if (!account.caldav) return { eligible: false, reason: 'local-account' };

  const parsedServerUrl = parseCalDAVServerUrl(account.caldav.serverUrl);
  if (!parsedServerUrl.ok) {
    return { eligible: false, reason: 'invalid-server-url' };
  }

  return { eligible: true };
};

export const getMobileConfigCredentialWarnings = (
  account: Account,
  includePassword: boolean,
): MobileConfigCredentialWarning[] => {
  if (!includePassword || account.caldav?.authType !== 'oauth') return [];
  return ['oauth-token-may-expire'];
};
