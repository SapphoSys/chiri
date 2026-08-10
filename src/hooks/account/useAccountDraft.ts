import { useCallback, useMemo, useState } from 'react';
import { getPredefinedServerUrl } from '$constants/settings';
import { createAccountDraft } from '$lib/account/draft';
import type { Account, AccountDraft, ServerType } from '$types/account';
import type { MobileConfigImportSelection } from '$types/mobileconfig/import';

interface UseAccountDraftOptions {
  account: Account | null;
  preloadedConfig?: MobileConfigImportSelection;
}

export const useAccountDraft = ({ account, preloadedConfig }: UseAccountDraftOptions) => {
  const [draft, setDraft] = useState<AccountDraft>(() =>
    createAccountDraft(account, preloadedConfig?.settings),
  );

  const updateDraft = useCallback((updates: Partial<AccountDraft>) => {
    setDraft((current) => ({ ...current, ...updates }));
  }, []);

  const setDraftField = useCallback(
    <K extends keyof AccountDraft>(field: K, value: AccountDraft[K]) => {
      setDraft((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const selectServerType = useCallback(
    (serverType: ServerType) => {
      updateDraft({
        name: '',
        icon: 'user',
        emoji: '',
        serverType,
        serverUrl: getPredefinedServerUrl(serverType) ?? '',
        username: '',
        password: '',
        calendarHomeUrl: '',
        principalUrl: '',
        acceptInvalidCerts: false,
      });
    },
    [updateDraft],
  );

  const hasChanges = useMemo(() => {
    if (!account) return true;

    return (
      draft.name !== (account.name || '') ||
      draft.icon !== (account.icon || 'user') ||
      draft.emoji !== (account.emoji || '') ||
      draft.serverType !== (account.caldav?.serverType || 'generic') ||
      draft.serverUrl !== (account.caldav?.serverUrl || '') ||
      draft.username !== (account.caldav?.username || '') ||
      draft.password.trim().length > 0 ||
      draft.calendarHomeUrl !== (account.caldav?.calendarHomeUrl || '') ||
      draft.principalUrl !== (account.caldav?.principalUrl || '') ||
      draft.acceptInvalidCerts !== (account.caldav?.acceptInvalidCerts ?? false)
    );
  }, [account, draft]);

  return {
    draft,
    updateDraft,
    setDraftField,
    selectServerType,
    hasChanges,
    effectivePassword: draft.password || account?.caldav?.password,
  };
};
