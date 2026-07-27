import { loggers } from '$lib/logger';
import type { CalDAVServerUrlParseResult } from '$types/caldav';

export const log = loggers.caldav;

export const cleanEtag = (etag: string | null | undefined) => {
  return etag?.replace(/"/g, '') ?? '';
};

export const normalizeUrl = (url: string) => {
  return url.replace(/\/$/, '');
};

export const hasHttpUrlScheme = (url: string) => {
  return /^https?:\/\//i.test(url.trim());
};

const getExplicitPort = (value: string) => {
  const authorityMatch = value.match(/^[a-z][a-z\d+.-]*:\/\/([^/?#]*)/i);
  const authority = authorityMatch?.[1];
  if (!authority) return undefined;

  const portMatch = authority.match(/:(\d+)$/);
  return portMatch?.[1] ? Number.parseInt(portMatch[1], 10) : undefined;
};

export const parseCalDAVServerUrl = (value: string): CalDAVServerUrlParseResult => {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, reason: 'missing-url' };

  const explicitPort = getExplicitPort(trimmed);
  if (explicitPort !== undefined && (explicitPort < 1 || explicitPort > 65535)) {
    return { ok: false, reason: 'invalid-port' };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, reason: 'invalid-url' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: 'unsupported-scheme' };
  }

  if (url.username || url.password) {
    return { ok: false, reason: 'embedded-credentials' };
  }

  if (!url.hostname) {
    return { ok: false, reason: 'missing-hostname' };
  }

  if (url.port) {
    const port = Number.parseInt(url.port, 10);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      return { ok: false, reason: 'invalid-port' };
    }
  }

  return { ok: true, url };
};

export const makeAbsoluteUrl = (href: string, baseUrl: string) => {
  return href.startsWith('http') ? href : new URL(href, baseUrl).toString();
};

export const isValidPrincipalUrlOverride = (value: string, baseUrl: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return true;

  if (trimmedValue.startsWith('//')) return false;

  try {
    const url = hasHttpUrlScheme(trimmedValue)
      ? new URL(trimmedValue)
      : new URL(trimmedValue, baseUrl);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.username || url.password) return false;

    return true;
  } catch {
    return false;
  }
};
