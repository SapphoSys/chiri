import { isValidPrincipalUrlOverride, parseCalDAVServerUrl } from '$lib/caldav/utils';
import { decodeMobileConfig } from '$lib/mobileconfig/decode';
import type {
  DecodedMobileConfig,
  DecodedMobileConfigCalDAVPayload,
} from '$types/mobileconfig/decode';
import type {
  MobileConfigCalDAVSettings,
  MobileConfigImportFailureReason,
  MobileConfigImportResult,
  MobileConfigSkippedCalDAVPayload,
} from '$types/mobileconfig/import';

type PayloadMappingResult =
  | { ok: true; settings: MobileConfigCalDAVSettings }
  | { ok: false; reason: MobileConfigImportFailureReason };

const trimOptional = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

const mapServerUrl = (
  payload: DecodedMobileConfigCalDAVPayload,
): { ok: true; serverUrl: string } | { ok: false; reason: MobileConfigImportFailureReason } => {
  const hostname = trimOptional(payload.hostname);
  if (!hostname) return { ok: false, reason: 'missing-hostname' };

  if (
    payload.port !== undefined &&
    (!Number.isInteger(payload.port) || payload.port < 1 || payload.port > 65535)
  ) {
    return { ok: false, reason: 'invalid-port' };
  }

  if (
    hostname.includes('/') ||
    hostname.includes('?') ||
    hostname.includes('#') ||
    hostname.includes('@')
  ) {
    return { ok: false, reason: 'invalid-hostname' };
  }

  const scheme = payload.useSSL === false ? 'http' : 'https';
  const isUnbracketedIpv6 = hostname.split(':').length > 2 && !hostname.startsWith('[');
  const authority = isUnbracketedIpv6 ? `[${hostname}]` : hostname;

  try {
    const url = new URL(`${scheme}://${authority}`);
    if (!url.hostname || url.username || url.password) {
      return { ok: false, reason: 'invalid-hostname' };
    }

    if (payload.port !== undefined) {
      if (url.port && Number(url.port) !== payload.port) {
        return { ok: false, reason: 'invalid-port' };
      }
      url.port = String(payload.port);
    }

    const parsedServerUrl = parseCalDAVServerUrl(url.origin);
    if (!parsedServerUrl.ok) {
      return {
        ok: false,
        reason: parsedServerUrl.reason === 'invalid-port' ? 'invalid-port' : 'invalid-hostname',
      };
    }

    return { ok: true, serverUrl: parsedServerUrl.url.origin };
  } catch {
    return { ok: false, reason: 'invalid-hostname' };
  }
};

const mapPrincipalUrl = (
  principalUrl: string | undefined,
  serverUrl: string,
): { ok: true; principalUrl?: string } | { ok: false; reason: 'invalid-principal-url' } => {
  const value = trimOptional(principalUrl);
  if (!value) return { ok: true };

  if (!isValidPrincipalUrlOverride(value, serverUrl)) {
    return { ok: false, reason: 'invalid-principal-url' };
  }

  return { ok: true, principalUrl: value };
};

const mapPayload = (payload: DecodedMobileConfigCalDAVPayload): PayloadMappingResult => {
  const server = mapServerUrl(payload);
  if (!server.ok) return server;

  const principal = mapPrincipalUrl(payload.principalUrl, server.serverUrl);
  if (!principal.ok) return principal;

  const username = trimOptional(payload.username);
  const payloadIdentifier = trimOptional(payload.payloadIdentifier);
  const payloadUuid = trimOptional(payload.payloadUuid);
  return {
    ok: true,
    settings: {
      accountName: trimOptional(payload.accountDescription) ?? username,
      serverUrl: server.serverUrl,
      username,
      password: payload.password,
      principalUrl: principal.principalUrl,
      ...(payloadIdentifier ? { payloadIdentifier } : {}),
      ...(payloadUuid ? { payloadUuid } : {}),
      serverType: 'generic',
    },
  };
};

/** validate and map every decoded CalDAV payload into Chiri's account setup shape */
export const mapDecodedMobileConfig = (profile: DecodedMobileConfig): MobileConfigImportResult => {
  const candidates: MobileConfigCalDAVSettings[] = [];
  const skippedCandidates: MobileConfigSkippedCalDAVPayload[] = [];
  for (const payload of profile.caldavPayloads) {
    const mapped = mapPayload(payload);
    if (!mapped.ok) {
      skippedCandidates.push({ reason: mapped.reason });
      continue;
    }
    candidates.push(mapped.settings);
  }

  if (candidates.length === 0) {
    return { ok: false, reason: skippedCandidates[0]?.reason ?? 'missing-caldav-payload' };
  }

  return {
    ok: true,
    format: profile.format,
    signature: profile.signature,
    ...(profile.signer ? { signer: profile.signer } : {}),
    candidates,
    ...(skippedCandidates.length > 0 ? { skippedCandidates } : {}),
  };
};

/** decode, validate, and map a configuration profile's CalDAV accounts */
export const importMobileConfig = async (bytes: Uint8Array): Promise<MobileConfigImportResult> => {
  const decoded = await decodeMobileConfig(bytes);
  return decoded.ok ? mapDecodedMobileConfig(decoded.profile) : decoded;
};
