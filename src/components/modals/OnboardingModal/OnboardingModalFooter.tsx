import ArrowRight from 'lucide-react/icons/arrow-right';
import Plus from 'lucide-react/icons/plus';
import { ModalButton } from '$components/ModalButton';

interface OnboardingModalFooterProps {
  needsCalDAVConnection: boolean;
  hasConnectedCalDAVHome: boolean;
  isHomeStep: boolean;
  primaryLabel: string;
  footerButtonClassName: string;
  onAddAccount: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingModalFooter = ({
  needsCalDAVConnection,
  hasConnectedCalDAVHome,
  isHomeStep,
  primaryLabel,
  footerButtonClassName,
  onAddAccount,
  onNext,
  onSkip,
}: OnboardingModalFooterProps) => (
  <div className="flex items-center gap-2">
    {hasConnectedCalDAVHome && isHomeStep && (
      <ModalButton variant="secondary" onClick={onAddAccount} className={footerButtonClassName}>
        Add more
        <Plus className="h-4 w-4" />
      </ModalButton>
    )}
    <ModalButton variant="ghost" onClick={onSkip} className={footerButtonClassName}>
      Set up later
    </ModalButton>
    <ModalButton
      onClick={needsCalDAVConnection ? onAddAccount : onNext}
      className={footerButtonClassName}
    >
      {primaryLabel}
      <ArrowRight className="h-4 w-4" />
    </ModalButton>
  </div>
);
