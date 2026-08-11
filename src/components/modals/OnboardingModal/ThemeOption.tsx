import Check from 'lucide-react/icons/check';
import type { ReactNode } from 'react';
import type { Theme } from '$types/color';

interface ThemeOptionProps {
  icon: ReactNode;
  label: string;
  selected: boolean;
  value: Theme;
  onSelect: (theme: Theme) => void;
}

export const ThemeOption = ({ icon, label, selected, value, onSelect }: ThemeOptionProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border px-3 font-medium text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-ink focus-visible:ring-inset ${
        selected
          ? 'border-primary-ink bg-primary-500/10 text-primary-ink dark:text-primary-300'
          : 'border-surface-200 text-surface-600 hover:bg-surface-100 dark:border-surface-700 dark:text-surface-400 dark:hover:bg-surface-700'
      }`}
      aria-pressed={selected}
    >
      {icon}
      <span>{label}</span>
      <Check className={`h-4 w-4 ${selected ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
};
