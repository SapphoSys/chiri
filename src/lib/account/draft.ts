import type { Account, AccountDraft } from '$types/account';

export const createAccountDraft = (
  account: Account | null,
  preloadedSettings?: Partial<AccountDraft> & { accountName?: string },
): AccountDraft => ({
  name: preloadedSettings?.name ?? preloadedSettings?.accountName ?? account?.name ?? '',
  icon: preloadedSettings?.icon ?? account?.icon ?? 'user',
  emoji: preloadedSettings?.emoji ?? account?.emoji ?? '',
  serverUrl: preloadedSettings?.serverUrl ?? account?.caldav?.serverUrl ?? '',
  username: preloadedSettings?.username ?? account?.caldav?.username ?? '',
  password: preloadedSettings?.password ?? '',
  serverType: preloadedSettings?.serverType ?? account?.caldav?.serverType ?? 'generic',
  calendarHomeUrl: preloadedSettings?.calendarHomeUrl ?? account?.caldav?.calendarHomeUrl ?? '',
  principalUrl: preloadedSettings?.principalUrl ?? account?.caldav?.principalUrl ?? '',
  acceptInvalidCerts:
    preloadedSettings?.acceptInvalidCerts ?? account?.caldav?.acceptInvalidCerts ?? false,
});
