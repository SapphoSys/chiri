import SlidersHorizontal from 'lucide-react/icons/sliders-horizontal';
import type { RefObject } from 'react';
import { FloatingDropdownFrame } from '$components/FloatingDropdownFrame';
import type { RepeatPreset } from '$lib/task/recurrence';

interface TaskEditorRepeatPresetMenuProps {
  anchorRef: RefObject<HTMLElement | null>;
  presets: RepeatPreset[];
  onSelect: (rrule: string) => void;
  onCustom: () => void;
  onClose: () => void;
}

const menuItemClass =
  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-surface-700 outline-hidden transition-colors hover:bg-surface-100 focus-visible:bg-surface-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:text-surface-300 dark:hover:bg-surface-700 dark:focus-visible:bg-surface-700';

export const TaskEditorRepeatPresetMenu = ({
  anchorRef,
  presets,
  onSelect,
  onCustom,
  onClose,
}: TaskEditorRepeatPresetMenuProps) => (
  <FloatingDropdownFrame
    anchorRef={anchorRef}
    onClose={onClose}
    align="start"
    fallbackWidth={240}
    fallbackHeight={280}
    dropdownClassName="z-50 min-w-60 overflow-hidden py-2"
  >
    <div role="menu" aria-label="Repeat presets">
      <div className="px-3 pb-1 font-medium text-sm text-surface-500 dark:text-surface-400">
        Repeat
      </div>
      <div className="space-y-1 px-1">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            role="menuitem"
            onClick={() => onSelect(preset.rrule)}
            className={menuItemClass}
          >
            <span className="min-w-0 flex-1 truncate">{preset.label}</span>
          </button>
        ))}
        <div className="mx-2 border-surface-200 border-t dark:border-surface-700" />
        <button type="button" role="menuitem" onClick={onCustom} className={menuItemClass}>
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-surface-400" />
          <span>Custom…</span>
        </button>
      </div>
    </div>
  </FloatingDropdownFrame>
);
