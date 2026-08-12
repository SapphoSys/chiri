import ArrowLeft from 'lucide-react/icons/arrow-left';
import ArrowRight from 'lucide-react/icons/arrow-right';
import CheckCircle from 'lucide-react/icons/check-circle';
import type { ReactNode, SyntheticEvent } from 'react';
import { ModalButton } from '$components/ModalButton';
import type { AccountModalStep } from '$components/modals/AccountModal/AccountModal';
import type { Account, AccountDraft } from '$types/account';

interface ButtonState {
  disabled: boolean;
  loading: boolean;
}

interface AccountModalFooterProps {
  placement: 'left' | 'main';
  account: Account | null;
  step: AccountModalStep;
  draft: AccountDraft;
  isLoading: boolean;
  isProcessing: boolean;
  isTesting: boolean;
  isAccountTestInProgress: boolean;
  testSuccess: boolean;
  hasChanges: boolean;
  quickConnectLoginStep: 'input' | 'authenticating' | 'processing';
  quickConnectButtonState: ButtonState;
  onQuickConnect: () => void;
  stalwartOAuthLoginStep: 'input' | 'authenticating' | 'processing';
  stalwartOAuthButtonState: ButtonState;
  onStalwartConnect: () => void;
  fastmailOAuthButtonState: ButtonState;
  onFastmailConnect: () => void;
  disrootCloudButtonState: ButtonState;
  onDisrootConnect: () => void;
  onTestConnection: () => void;
  onSubmit: (event: SyntheticEvent) => void;
  onClose: () => void;
  onBack?: () => void;
}

export const renderAccountModalFooter = ({
  placement,
  account,
  step,
  draft,
  isLoading,
  isProcessing,
  isTesting,
  isAccountTestInProgress,
  testSuccess,
  hasChanges,
  quickConnectLoginStep,
  quickConnectButtonState,
  onQuickConnect,
  stalwartOAuthLoginStep,
  stalwartOAuthButtonState,
  onStalwartConnect,
  fastmailOAuthButtonState,
  onFastmailConnect,
  disrootCloudButtonState,
  onDisrootConnect,
  onTestConnection,
  onSubmit,
  onClose,
  onBack,
}: AccountModalFooterProps): ReactNode => {
  const testConnectionButton = (
    <ModalButton
      variant="secondary"
      onClick={onTestConnection}
      disabled={
        isTesting ||
        isAccountTestInProgress ||
        isLoading ||
        testSuccess ||
        !draft.serverUrl.trim() ||
        !draft.username.trim() ||
        (!draft.password.trim() && !account?.caldav?.password)
      }
      loading={isTesting || isAccountTestInProgress}
    >
      {testSuccess && <CheckCircle className="h-4 w-4 text-semantic-success" />}
      {testSuccess
        ? 'Success'
        : isTesting || isAccountTestInProgress
          ? 'Testing...'
          : 'Test connection'}
    </ModalButton>
  );

  if (placement === 'left') {
    if (account && step === 'credentials') return testConnectionButton;
    if (!account && step !== 'pick-type' && !isProcessing && onBack) {
      return (
        <ModalButton variant="secondary" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </ModalButton>
      );
    }
    return null;
  }

  if (step === 'quick-connect' && quickConnectLoginStep === 'input') {
    return (
      <ModalButton
        onClick={onQuickConnect}
        disabled={quickConnectButtonState.disabled}
        loading={quickConnectButtonState.loading}
      >
        Connect
        <ArrowRight className="size-4" />
      </ModalButton>
    );
  }

  if (step === 'stalwart-oauth' && stalwartOAuthLoginStep === 'input') {
    return (
      <ModalButton
        onClick={onStalwartConnect}
        disabled={stalwartOAuthButtonState.disabled}
        loading={stalwartOAuthButtonState.loading}
      >
        Connect
        <ArrowRight className="size-4" />
      </ModalButton>
    );
  }

  if (step === 'fastmail-oauth' && !fastmailOAuthButtonState.disabled) {
    return (
      <ModalButton
        onClick={onFastmailConnect}
        disabled={fastmailOAuthButtonState.disabled}
        loading={fastmailOAuthButtonState.loading}
      >
        Connect
        <ArrowRight className="size-4" />
      </ModalButton>
    );
  }

  if (step === 'disrootCloud-browser' && !disrootCloudButtonState.disabled) {
    return (
      <ModalButton
        onClick={onDisrootConnect}
        disabled={disrootCloudButtonState.disabled}
        loading={disrootCloudButtonState.loading}
      >
        Connect
        <ArrowRight className="size-4" />
      </ModalButton>
    );
  }

  if (step !== 'credentials') return null;

  if (account) {
    return (
      <>
        <ModalButton variant="secondary" onClick={onClose}>
          Cancel
        </ModalButton>
        <ModalButton
          onClick={onSubmit}
          disabled={
            isLoading ||
            !hasChanges ||
            !draft.name.trim() ||
            !draft.serverUrl.trim() ||
            !draft.username.trim()
          }
          loading={isLoading}
        >
          Save
        </ModalButton>
      </>
    );
  }

  return (
    <>
      {testConnectionButton}
      <ModalButton
        onClick={onSubmit}
        disabled={
          isLoading ||
          !draft.name.trim() ||
          !draft.serverUrl.trim() ||
          !draft.username.trim() ||
          !draft.password.trim()
        }
        loading={isLoading}
      >
        Add Account
      </ModalButton>
    </>
  );
};
