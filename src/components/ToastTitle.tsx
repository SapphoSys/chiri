import type { LucideIcon } from 'lucide-react';
import Check from 'lucide-react/icons/check';
import CircleX from 'lucide-react/icons/circle-x';
import Info from 'lucide-react/icons/info';
import Loader2 from 'lucide-react/icons/loader-2';
import TriangleAlert from 'lucide-react/icons/triangle-alert';
import type { ReactNode } from 'react';

export type ToastType = 'error' | 'warning' | 'info' | 'success' | 'loading';

const TYPE_ICONS: Record<ToastType, { icon: LucideIcon; colorClass: string }> = {
  error: { icon: CircleX, colorClass: 'text-semantic-error' },
  warning: { icon: TriangleAlert, colorClass: 'text-semantic-warning' },
  info: { icon: Info, colorClass: 'text-primary-ink' },
  success: { icon: Check, colorClass: 'text-primary-ink' },
  loading: { icon: Loader2, colorClass: 'text-primary-ink' },
};

interface ToastTitleProps {
  type: ToastType;
  children?: ReactNode;
}

/**
 * standardized toast title: the type icon rendered inline with the title text
 * pairs with `icon: null` on the sonner toast so the default type icon is suppressed
 */
export const ToastTitle = ({ type, children }: ToastTitleProps) => {
  const { icon: Icon, colorClass } = TYPE_ICONS[type];

  return (
    <span className="inline-flex items-center gap-2">
      <Icon
        className={`h-4 w-4 shrink-0 ${colorClass} ${type === 'loading' ? 'motion-safe:animate-spin' : ''}`}
        aria-hidden={true}
      />
      {children}
    </span>
  );
};
