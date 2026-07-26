import BellRing from 'lucide-react/icons/bell-ring';
import { ModalWrapper } from '$components/ModalWrapper';
import type { DefaultReminderOffset } from '$types/settings/categories/defaults';

interface TaskDefaultsReminderPickerModalProps {
  available: { value: DefaultReminderOffset; label: string }[];
  onSelect: (offset: DefaultReminderOffset) => void;
  onClose: () => void;
  editing?: DefaultReminderOffset;
}

export const TaskDefaultsReminderPickerModal = ({
  available,
  onSelect,
  onClose,
  editing,
}: TaskDefaultsReminderPickerModalProps) => {
  return (
    <ModalWrapper
      onClose={onClose}
      title={editing ? 'Edit Default Reminder' : 'Add Default Reminder'}
      zIndex="z-70"
      className="max-w-xs"
      contentPadding={false}
    >
      <div className="max-h-112 overflow-y-auto py-2">
        {available.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onSelect(opt.value);
              onClose();
            }}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm outline-hidden transition-colors focus-visible:bg-surface-50 dark:focus-visible:bg-surface-700 ${
              opt.value === editing
                ? 'bg-surface-100 font-medium text-surface-800 dark:bg-surface-700 dark:text-surface-200'
                : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-700'
            }`}
          >
            <BellRing className="h-4 w-4 shrink-0 text-surface-400" />
            {opt.label}
          </button>
        ))}
      </div>
    </ModalWrapper>
  );
};
