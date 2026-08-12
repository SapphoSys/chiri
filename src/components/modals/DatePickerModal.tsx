import { ModalButton } from '$components/ModalButton';
import { ModalWrapper } from '$components/ModalWrapper';
import { DateTimePickerBody } from '$components/modals/DateTimePickerBody';
import { useDateTimePickerDraft } from '$hooks/ui/useDateTimePickerDraft';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value?: Date;
  onChange: (date: Date | undefined, allDay?: boolean) => void;
  title: string;
  allDay?: boolean;
  onAllDayChange?: (allDay: boolean) => void;
  hideTimeControls?: boolean;
}

export const DatePickerModal = ({
  isOpen,
  onClose,
  value,
  onChange,
  title,
  allDay = false,
  onAllDayChange,
  hideTimeControls = false,
}: DatePickerModalProps) => {
  const draft = useDateTimePickerDraft({
    isOpen,
    value,
    supportsNoTime: true,
    allDay,
  });

  if (!isOpen) return null;

  const handleClear = () => {
    onChange(undefined, false);
    onAllDayChange?.(false);
    draft.clearLocalValue();
  };

  const handleDone = () => {
    onChange(draft.localValue, draft.localNoTime);
    onAllDayChange?.(draft.localNoTime);
    onClose();
  };

  const clearButton =
    draft.localValue || draft.initialValue ? (
      <ModalButton
        variant="secondary"
        onClick={handleClear}
        className="text-surface-500 hover:bg-semantic-error/10 hover:text-semantic-error dark:text-surface-400"
      >
        Clear
      </ModalButton>
    ) : null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-120"
      zIndex="z-60"
      contentPadding={false}
      initialFocus="dialog"
      footerLeft={clearButton}
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            Cancel
          </ModalButton>
          <ModalButton onClick={handleDone} disabled={!draft.localValue && !draft.initialValue}>
            Done
          </ModalButton>
        </>
      }
    >
      <DateTimePickerBody draft={draft} hideTimeControls={hideTimeControls} />
    </ModalWrapper>
  );
};
