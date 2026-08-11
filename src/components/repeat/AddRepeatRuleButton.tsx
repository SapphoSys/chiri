import Plus from 'lucide-react/icons/plus';
import { useRef, useState } from 'react';
import { RepeatPresetMenu } from '$components/repeat/RepeatPresetMenu';
import type { RepeatPreset } from '$lib/task/recurrence';

interface AddRepeatRuleButtonProps {
  presets: RepeatPreset[];
  onSelect: (rrule: string) => void;
  onCustom: () => void;
}

export const AddRepeatRuleButton = ({ presets, onSelect, onCustom }: AddRepeatRuleButtonProps) => {
  const [showPresets, setShowPresets] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={addButtonRef}
        type="button"
        onClick={() => setShowPresets((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={showPresets}
        className="inline-flex items-center gap-1 rounded-sm border border-surface-300 bg-surface-100 px-2 py-1 text-surface-700 text-xs outline-hidden transition-colors hover:border-surface-400 hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset dark:border-surface-600 dark:bg-surface-800 dark:text-surface-300 dark:hover:border-surface-500 dark:hover:bg-surface-700"
      >
        <Plus className="h-3 w-3" />
        Add repeat rule
      </button>
      {showPresets && (
        <RepeatPresetMenu
          anchorRef={addButtonRef}
          presets={presets}
          onSelect={(rrule) => {
            onSelect(rrule);
            setShowPresets(false);
          }}
          onCustom={() => {
            setShowPresets(false);
            onCustom();
          }}
          onClose={() => setShowPresets(false)}
        />
      )}
    </>
  );
};
