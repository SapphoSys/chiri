import { beforeEach, describe, expect, it, vi } from 'vitest';
import { shareMobileConfig } from '$lib/mobileconfig/share';
import type { Account } from '$types/account';

const account = (): Account => ({
  id: 'account-1',
  name: 'Work',
  icon: 'user',
  emoji: '',
  calendars: [],
  isActive: true,
  sortOrder: 0,
  caldav: {
    serverUrl: 'https://caldav.example.test',
    username: 'alice',
    password: 'secret',
    serverType: 'generic',
    principalUrl: '/principals/alice/',
    authType: 'basic',
  },
});

describe('shareMobileConfig', () => {
  const share = vi.fn();
  const canShare = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('navigator', {
      share,
      canShare,
    });
    share.mockReset();
    canShare.mockReset();
  });

  it('shares the generated profile when the Web Share API is available', async () => {
    canShare.mockReturnValue(true);
    share.mockResolvedValue(undefined);

    const result = await shareMobileConfig(account(), { profileUuid: 'p', payloadUuid: 'u' });

    expect(result).toBe('shared');
    expect(share).toHaveBeenCalledOnce();
    expect(share.mock.calls[0][0].files).toHaveLength(1);
    expect(share.mock.calls[0][0].files[0].name).toMatch(/\.mobileconfig$/);
  });

  it('returns unsupported when sharing is not supported', async () => {
    canShare.mockReturnValue(false);

    const result = await shareMobileConfig(account(), { profileUuid: 'p', payloadUuid: 'u' });

    expect(result).toBe('unsupported');
    expect(share).not.toHaveBeenCalled();
  });

  it('returns unsupported when the share API throws', async () => {
    canShare.mockReturnValue(true);
    share.mockRejectedValue(new Error('share failed'));

    const result = await shareMobileConfig(account(), { profileUuid: 'p', payloadUuid: 'u' });

    expect(result).toBe('unsupported');
    expect(share).toHaveBeenCalledOnce();
  });

  it('rethrows AbortError when the user cancels the share sheet', async () => {
    canShare.mockReturnValue(true);
    const abortError = new Error('User cancelled');
    abortError.name = 'AbortError';
    share.mockRejectedValue(abortError);

    await expect(
      shareMobileConfig(account(), { profileUuid: 'p', payloadUuid: 'u' }),
    ).rejects.toThrow('User cancelled');
  });

  it('returns unsupported when sharing is unavailable', async () => {
    vi.stubGlobal('navigator', { share: undefined });

    const result = await shareMobileConfig(account(), { profileUuid: 'p', payloadUuid: 'u' });

    expect(result).toBe('unsupported');
  });
});
