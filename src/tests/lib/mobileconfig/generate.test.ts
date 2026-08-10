import { DOMParser, type Element } from '@xmldom/xmldom';
import { describe, expect, it } from 'vitest';
import {
  generateMobileConfig,
  getMobileConfigCredentialWarnings,
  getMobileConfigExportEligibility,
} from '$lib/mobileconfig/generate';
import { mapDecodedMobileConfig } from '$lib/mobileconfig/import';
import type { Account } from '$types/account';
import type {
  DecodedMobileConfig,
  DecodedMobileConfigCalDAVPayload,
} from '$types/mobileconfig/decode';

const account = (overrides: Partial<Account> = {}): Account => ({
  id: 'account-1',
  name: 'Work & Personal',
  icon: 'user',
  emoji: '',
  calendars: [],
  isActive: true,
  sortOrder: 0,
  caldav: {
    serverUrl: 'https://caldav.example.test:8443',
    username: 'alice@example.test',
    password: 'app-password',
    serverType: 'generic',
    principalUrl: '/principals/alice/',
    authType: 'basic',
  },
  ...overrides,
});

const elementChildren = (element: Element) =>
  Array.from(element.childNodes).filter((node): node is Element => node.nodeType === 1);

const getNextElement = (elements: Element[], index: number) => elements[index + 1];

const textContent = (element: Element) => element.textContent ?? '';

const parseMobileConfigPayloadDict = (dict: Element): DecodedMobileConfigCalDAVPayload => {
  const elements = elementChildren(dict);
  const payload: DecodedMobileConfigCalDAVPayload = {};

  for (let index = 0; index < elements.length; index += 1) {
    const key = elements[index];
    if (key?.tagName !== 'key') continue;

    const value = getNextElement(elements, index);
    if (!value) continue;

    switch (textContent(key)) {
      case 'CalDAVAccountDescription':
        payload.accountDescription = textContent(value);
        break;
      case 'CalDAVHostName':
        payload.hostname = textContent(value);
        break;
      case 'CalDAVPort':
        payload.port = Number.parseInt(textContent(value), 10);
        break;
      case 'CalDAVUseSSL':
        payload.useSSL = value.tagName === 'true';
        break;
      case 'CalDAVUsername':
        payload.username = textContent(value);
        break;
      case 'CalDAVPassword':
        payload.password = textContent(value);
        break;
      case 'CalDAVPrincipalURL':
        payload.principalUrl = textContent(value);
        break;
      case 'PayloadIdentifier':
        payload.payloadIdentifier = textContent(value);
        break;
      case 'PayloadUUID':
        payload.payloadUuid = textContent(value);
        break;
    }
  }

  return payload;
};

const parseGeneratedProfile = (xml: string): DecodedMobileConfig => {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  expect(document.getElementsByTagName('parsererror')).toHaveLength(0);

  const plist = document.getElementsByTagName('plist')[0];
  expect(plist).toBeTruthy();

  const profileDict = elementChildren(plist)[0];
  expect(profileDict?.nodeName).toBe('dict');

  const profileElements = elementChildren(profileDict);
  const payloadContentKeyIndex = profileElements.findIndex(
    (element) => element.tagName === 'key' && textContent(element) === 'PayloadContent',
  );
  const payloadContent = getNextElement(profileElements, payloadContentKeyIndex);
  expect(payloadContent?.tagName).toBe('array');

  const caldavPayloads = elementChildren(payloadContent as Element)
    .filter((element) => element.tagName === 'dict')
    .map(parseMobileConfigPayloadDict)
    .filter((payload) => payload.payloadIdentifier?.startsWith('com.apple.caldav.account.'));

  return {
    format: 'xml',
    signature: 'unsigned',
    caldavPayloads,
  };
};

describe('generateMobileConfig', () => {
  it('generates a deterministic CalDAV configuration profile without credentials by default', () => {
    const xml = generateMobileConfig(account(), {
      profileUuid: 'profile-id',
      payloadUuid: 'payload-id',
    });

    expect(xml).toContain('<key>CalDAVAccountDescription</key>');
    expect(xml).toContain('<string>Work &amp; Personal</string>');
    expect(xml).toContain('<key>CalDAVHostName</key>\n\t\t\t<string>caldav.example.test</string>');
    expect(xml).toContain('<key>CalDAVPort</key>\n\t\t\t<integer>8443</integer>');
    expect(xml).toContain('<key>CalDAVUseSSL</key>\n\t\t\t<true/>');
    expect(xml).toContain('<key>CalDAVUsername</key>\n\t\t\t<string>alice@example.test</string>');
    expect(xml).toContain(
      '<key>CalDAVPrincipalURL</key>\n\t\t\t<string>/principals/alice/</string>',
    );
    expect(xml).toContain('<string>PROFILE-ID</string>');
    expect(xml).toContain('<string>PAYLOAD-ID</string>');
    expect(xml).not.toContain('CalDAVPassword');
    expect(xml).not.toContain('app-password');
  });

  it('embeds the credential only when explicitly requested', () => {
    const xml = generateMobileConfig(account(), {
      includePassword: true,
      profileUuid: 'profile-id',
      payloadUuid: 'payload-id',
    });

    expect(xml).toContain('<key>CalDAVPassword</key>');
    expect(xml).toContain('<string>app-password</string>');
  });

  it('round-trips a generated HTTPS profile through profile parsing and import mapping', () => {
    const xml = generateMobileConfig(account(), {
      includePassword: true,
      profileUuid: 'profile-id',
      payloadUuid: 'payload-id',
    });

    const profile = parseGeneratedProfile(xml);
    const result = mapDecodedMobileConfig(profile);

    expect(profile.caldavPayloads).toHaveLength(1);
    expect(result).toEqual({
      ok: true,
      format: 'xml',
      signature: 'unsigned',
      candidates: [
        {
          accountName: 'Work & Personal',
          serverUrl: 'https://caldav.example.test:8443',
          username: 'alice@example.test',
          password: 'app-password',
          principalUrl: '/principals/alice/',
          payloadIdentifier: 'com.apple.caldav.account.PAYLOAD-ID',
          payloadUuid: 'PAYLOAD-ID',
          serverType: 'generic',
        },
      ],
    });
  });

  it('round-trips a generated HTTP profile without optional credentials or principal URL', () => {
    const xml = generateMobileConfig(
      account({
        name: 'Local Dev',
        caldav: {
          serverUrl: 'http://localhost:5232',
          username: 'alice',
          password: 'secret',
          serverType: 'generic',
          authType: 'basic',
        },
      }),
      { profileUuid: 'profile-id', payloadUuid: 'payload-id' },
    );

    const result = mapDecodedMobileConfig(parseGeneratedProfile(xml));

    expect(result).toEqual({
      ok: true,
      format: 'xml',
      signature: 'unsigned',
      candidates: [
        {
          accountName: 'Local Dev',
          serverUrl: 'http://localhost:5232',
          username: 'alice',
          password: undefined,
          principalUrl: undefined,
          payloadIdentifier: 'com.apple.caldav.account.PAYLOAD-ID',
          payloadUuid: 'PAYLOAD-ID',
          serverType: 'generic',
        },
      ],
    });
  });

  it('rejects invalid server URLs while generating', () => {
    expect(() =>
      generateMobileConfig(
        account({
          caldav: {
            serverUrl: 'https://example.test:0',
            username: 'alice',
            password: 'secret',
            serverType: 'generic',
            authType: 'basic',
          },
        }),
        { profileUuid: 'profile-id', payloadUuid: 'payload-id' },
      ),
    ).toThrow('Account has an invalid CalDAV server URL');
  });

  it('uses HTTP only when the account URL uses HTTP', () => {
    const xml = generateMobileConfig(
      account({
        caldav: {
          serverUrl: 'http://localhost:5232',
          username: 'alice',
          password: 'secret',
          serverType: 'generic',
          authType: 'basic',
        },
      }),
      { profileUuid: 'profile-id', payloadUuid: 'payload-id' },
    );

    expect(xml).toContain('<key>CalDAVHostName</key>\n\t\t\t<string>localhost</string>');
    expect(xml).toContain('<key>CalDAVPort</key>\n\t\t\t<integer>5232</integer>');
    expect(xml).toContain('<key>CalDAVUseSSL</key>\n\t\t\t<false/>');
  });

  it('rejects accounts that cannot be exported safely', () => {
    expect(getMobileConfigExportEligibility(account({ caldav: null }))).toEqual({
      eligible: false,
      reason: 'local-account',
    });
    expect(
      getMobileConfigExportEligibility(
        account({
          caldav: {
            serverUrl: 'ftp://example.test',
            username: 'alice',
            password: 'secret',
            serverType: 'generic',
            authType: 'basic',
          },
        }),
      ),
    ).toEqual({ eligible: false, reason: 'invalid-server-url' });
    expect(
      getMobileConfigExportEligibility(
        account({
          caldav: {
            serverUrl: 'https://example.test:0',
            username: 'alice',
            password: 'secret',
            serverType: 'generic',
            authType: 'basic',
          },
        }),
      ),
    ).toEqual({ eligible: false, reason: 'invalid-server-url' });
    expect(getMobileConfigExportEligibility(account())).toEqual({ eligible: true });
  });

  it('warns only when exporting an OAuth account credential', () => {
    const oauthAccount = account({
      caldav: {
        serverUrl: 'https://caldav.fastmail.com',
        username: 'alice@example.test',
        password: 'access-token',
        serverType: 'fastmail',
        authType: 'oauth',
        refreshToken: 'refresh-token',
        tokenExpiry: '2030-01-01T00:00:00.000Z',
      },
    });

    expect(getMobileConfigCredentialWarnings(oauthAccount, false)).toEqual([]);
    expect(getMobileConfigCredentialWarnings(oauthAccount, true)).toEqual([
      'oauth-token-may-expire',
    ]);
    expect(getMobileConfigCredentialWarnings(account(), true)).toEqual([]);
  });
});
